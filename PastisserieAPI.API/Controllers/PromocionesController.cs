using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromocionesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public PromocionesController(IUnitOfWork unitOfWork, IMapper mapper, ApplicationDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool mostrarTodas = false)
        {
            var now = DateTime.UtcNow;

            // Incluir Producto para mapear ProductoNombre y ProductoImagenUrl
            var query = _context.Promociones.Include(p => p.Producto).AsQueryable();

            // Por defecto (tienda), solo mostrar activas y vigentes.
            // Si mostrarTodas es true (y es admin), mostrar el listado completo.
            if (!mostrarTodas || !User.IsInRole("Admin"))
            {
                query = query.Where(p => p.Activo && p.FechaInicio <= now && p.FechaFin >= now);
            }

            var promociones = await query.ToListAsync();
            var promocionesDto = _mapper.Map<List<PromocionResponseDto>>(promociones);
            return Ok(ApiResponse<List<PromocionResponseDto>>.SuccessResponse(promocionesDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (promocion == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Promoción con ID {id} no encontrada"));
            }
            var promocionDto = _mapper.Map<PromocionResponseDto>(promocion);
            return Ok(ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreatePromocionRequestDto request)
        {
            if (request.FechaFin <= request.FechaInicio)
            {
                return BadRequest(ApiResponse.ErrorResponse("La fecha de fin debe ser posterior a la fecha de inicio"));
            }

            // Validar que el producto existe si se envía ProductoId
            if (request.ProductoId.HasValue)
            {
                var productoExiste = await _unitOfWork.Productos.ExistsAsync(p => p.Id == request.ProductoId.Value);
                if (!productoExiste)
                {
                    return BadRequest(ApiResponse.ErrorResponse($"El producto con ID {request.ProductoId.Value} no existe"));
                }
            }

            // PrecioOriginal es obligatorio para promociones independientes (sin producto)
            if (!request.ProductoId.HasValue && (!request.PrecioOriginal.HasValue || request.PrecioOriginal.Value <= 0))
            {
                return BadRequest(ApiResponse.ErrorResponse("El precio original es obligatorio para promociones independientes"));
            }

            var promocion = _mapper.Map<Promocion>(request);
            await _unitOfWork.Promociones.AddAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            // Recargar con Include para devolver datos del producto
            var promocionConProducto = await _context.Promociones
                .Include(p => p.Producto)
                .FirstOrDefaultAsync(p => p.Id == promocion.Id);

            var promocionDto = _mapper.Map<PromocionResponseDto>(promocionConProducto);
            return CreatedAtAction(nameof(GetById), new { id = promocion.Id }, 
                ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto, "Promoción creada exitosamente"));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdatePromocionRequestDto request)
        {
            if (id != request.Id) return BadRequest(ApiResponse.ErrorResponse("ID no coincide"));

            var promocion = await _unitOfWork.Promociones.GetByIdAsync(id);
            if (promocion == null) return NotFound(ApiResponse.ErrorResponse("Promoción no encontrada"));

            if (request.FechaFin <= request.FechaInicio)
            {
                return BadRequest(ApiResponse.ErrorResponse("La fecha de fin debe ser posterior a la fecha de inicio"));
            }

            // Validar que el producto existe si se envía ProductoId
            if (request.ProductoId.HasValue)
            {
                var productoExiste = await _unitOfWork.Productos.ExistsAsync(p => p.Id == request.ProductoId.Value);
                if (!productoExiste)
                {
                    return BadRequest(ApiResponse.ErrorResponse($"El producto con ID {request.ProductoId.Value} no existe"));
                }
            }

            // PrecioOriginal es obligatorio para promociones independientes (sin producto)
            if (!request.ProductoId.HasValue && (!request.PrecioOriginal.HasValue || request.PrecioOriginal.Value <= 0))
            {
                return BadRequest(ApiResponse.ErrorResponse("El precio original es obligatorio para promociones independientes"));
            }

            _mapper.Map(request, promocion);
            await _unitOfWork.Promociones.UpdateAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            // Recargar con Include para devolver datos del producto
            var promocionConProducto = await _context.Promociones
                .Include(p => p.Producto)
                .FirstOrDefaultAsync(p => p.Id == promocion.Id);

            var promocionDto = _mapper.Map<PromocionResponseDto>(promocionConProducto);
            return Ok(ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto, "Promoción actualizada exitosamente"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var promocion = await _unitOfWork.Promociones.GetByIdAsync(id);
            if (promocion == null) return NotFound(ApiResponse.ErrorResponse("Promoción no encontrada"));

            await _unitOfWork.Promociones.DeleteAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Promoción eliminada exitosamente"));
        }
    }
}

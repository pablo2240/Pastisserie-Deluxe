using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class ProductoRepository : Repository<Producto>, IProductoRepository
    {
        public ProductoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Producto>> GetAllAsync()
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetByCategoriaAsync(int categoriaId)
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .Where(p => p.CategoriaProductoId == categoriaId && p.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetPersonalizablesAsync()
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .Where(p => p.EsPersonalizable && p.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetProductosActivosAsync()
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .Where(p => p.Activo)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<Producto>> GetProductosBajoStockAsync()
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .Where(p => p.StockMinimo.HasValue && p.Stock <= p.StockMinimo.Value)
                .ToListAsync();
        }

        public async Task<Producto?> GetByIdWithReviewsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.CategoriaProducto)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
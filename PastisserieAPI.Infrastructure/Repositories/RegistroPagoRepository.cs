using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class RegistroPagoRepository : IRegistroPagoRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<RegistroPago> _dbSet;

        public RegistroPagoRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<RegistroPago>();
        }

        public async Task<RegistroPago?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<RegistroPago>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<RegistroPago> AddAsync(RegistroPago entity)
        {
            await _dbSet.AddAsync(entity);
            return entity;
        }

        public Task UpdateAsync(RegistroPago entity)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(RegistroPago entity)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<RegistroPago?> GetByPedidoIdAsync(int pedidoId)
        {
            return await _dbSet
                .Include(r => r.Pedido)
                .Where(r => r.PedidoId == pedidoId)
                .OrderByDescending(r => r.FechaIntento)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<RegistroPago>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _dbSet
                .Include(r => r.Pedido)
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.FechaIntento)
                .ToListAsync();
        }

        public async Task<RegistroPago?> GetUltimoIntentoAsync(int pedidoId)
        {
            return await _dbSet
                .Where(r => r.PedidoId == pedidoId)
                .OrderByDescending(r => r.FechaIntento)
                .FirstOrDefaultAsync();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class TiendaService : ITiendaService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ApplicationDbContext _context;

        public TiendaService(IUnitOfWork unitOfWork, ApplicationDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        public async Task<ConfiguracionTienda?> GetConfiguracionAsync()
        {
            return await _context.ConfiguracionTienda
                .Include(c => c.HorariosPorDia)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsStoreOpenAsync()
        {
            var config = await GetConfiguracionAsync();
            if (config == null) return true; // Default to open if no config found

            return EstaAbierto(config);
        }

        public bool EstaAbierto(ConfiguracionTienda config)
        {
            // 1. Interruptor Maestro: Si el sistema NO está activo manualmente, la tienda está CERRADA
            // Independientemente de cualquier otro ajuste o del horario.
            if (!config.SistemaActivoManual) return false;

            // 2. Control de Horario: Si el usuario desactiva el control de horario,
            // la tienda se considera abierta 24/7 (siempre que el SistemaActivoManual sea true).
            if (!config.UsarControlHorario) return true;

            // 3. Obtención del Tiempo Local (Bogotá/Medellín - UTC-5)
            DateTime localNow;
            try {
                TimeZoneInfo bogotaZone;
                try {
                    bogotaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
                } catch {
                    bogotaZone = TimeZoneInfo.FindSystemTimeZoneById("America/Bogota");
                }
                localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, bogotaZone);
            } catch {
                localNow = DateTime.UtcNow.AddHours(-5);
            }
            
            var horaActual = localNow.TimeOfDay;
            var diaActualInt = (int)localNow.DayOfWeek;

            // 4. Validación por Horarios Específicos (HorariosPorDia)
            if (config.HorariosPorDia != null && config.HorariosPorDia.Any())
            {
                var horarioDia = config.HorariosPorDia.FirstOrDefault(h => 
                    h.DiaSemana == diaActualInt || (diaActualInt == 0 && h.DiaSemana == 7));
                
                if (horarioDia == null || !horarioDia.Abierto) return false;

                // Normalización de tiempos para comparación precisa
                var apertura = new TimeSpan(horarioDia.HoraApertura.Hours, horarioDia.HoraApertura.Minutes, 0);
                var cierre = new TimeSpan(horarioDia.HoraCierre.Hours, horarioDia.HoraCierre.Minutes, 59);
                var actual = new TimeSpan(horaActual.Hours, horaActual.Minutes, horaActual.Seconds);

                return actual >= apertura && actual <= cierre;
            }

            // 5. Fallback Legacy: DiasLaborales (String format "1,2,3,4,5")
            var diaActualStr = diaActualInt.ToString();
            if (!string.IsNullOrEmpty(config.DiasLaborales) && !config.DiasLaborales.Contains(diaActualStr))
                return false;

            // 6. Fallback Global: HoraApertura/HoraCierre generales de la tienda
            var aperturaGlobal = new TimeSpan(config.HoraApertura.Hours, config.HoraApertura.Minutes, 0);
            var cierreGlobal = new TimeSpan(config.HoraCierre.Hours, config.HoraCierre.Minutes, 0);
            var actualNorm = new TimeSpan(horaActual.Hours, horaActual.Minutes, 0);
            
            return actualNorm >= aperturaGlobal && actualNorm <= cierreGlobal;
        }
    }
}

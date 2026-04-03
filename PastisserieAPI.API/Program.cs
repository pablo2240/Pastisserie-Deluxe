using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Infrastructure.Services;
using PastisserieAPI.API.Middleware;
using PastisserieAPI.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ============ CONFIGURACIÓN DE ZONA HORARIA (BOGOTÁ, COLOMBIA) ============
var bogotaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
TimeZoneInfo.ClearCachedData();
Console.WriteLine($"🌎 Zona horaria configurada: {bogotaZone.DisplayName}");

// Configurar cultura para formato de fechas
var culture = new System.Globalization.CultureInfo("es-CO");
culture.DateTimeFormat.ShortDatePattern = "yyyy-MM-dd";
culture.DateTimeFormat.LongDatePattern = "yyyy-MM-dd HH:mm:ss";
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = culture;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = culture;

// ============ CONFIGURACIÓN DE SERVICIOS ============

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Configurar DbContext con SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null
        )
    )
);

// Extensiones de Inyección de Dependencias (Modularizado)
builder.Services.AddInfrastructureServices();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();

builder.Services.AddAuthorization();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:7108",
                "http://localhost:5174",
                builder.Configuration["FrontendUrl"] ?? "http://localhost:5173"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ============ CONFIGURACIÓN DEL PIPELINE HTTP ============

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pastisserie API V1");
    });
}

// ============ SUBCOMANDO 'limpiar-db' ============
if (args.Contains("limpiar-db", StringComparer.OrdinalIgnoreCase))
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            var logger = services.GetRequiredService<ILogger<Program>>();
            PastisserieAPI.Infrastructure.Data.DbInitializer.RunOnlyCleanOrphanData(context, logger);
            app.Logger.LogInformation("🎉 Limpieza ejecutada. Fin del proceso (sin iniciar API HTTP). Puedes correr luego 'dotnet run' normal.");
            return; // Sale: NO inicia la API
        }
        catch (Exception ex)
        {
            app.Logger.LogCritical(ex, "Error fatal durante la limpieza con 'limpiar-db'.");
            Environment.Exit(-1);
        }
    }
}

// ============ INICIALIZACIÓN DE BASE DE DATOS ============
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        DbInitializer.Initialize(context, logger);
    }
    catch (Exception ex)
    {
        app.Logger.LogCritical(ex, "Error fatal durante la inicialización de la base de datos.");
    }
}

app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ============ MENSAJE DE INICIO ============
app.Logger.LogInformation("🍰 Pastisserie API iniciada correctamente con arquitectura profesional");
app.Logger.LogInformation("📊 Base de datos: {ConnectionString}",
    builder.Configuration.GetConnectionString("DefaultConnection")?.Split(';')[0]);

app.Run();
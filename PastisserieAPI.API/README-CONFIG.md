# Configuración Local - Pastisserie API

## Setup Inicial

1. **Copiar el template:**
   ```bash
   cp appsettings.Example.json appsettings.json
   ```

2. **Editar `appsettings.json` con tus credenciales locales:**

   - **ConnectionString**: Tu SQL Server local
     ```
     Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True
     ```

   - **JwtSettings.SecretKey**: Generar nueva clave (ver abajo)

   - **Smtp**: Configuración de Gmail (opcional para desarrollo)

3. **IMPORTANTE: NUNCA commitear `appsettings.json`**
   - El archivo está en `.gitignore`
   - Contiene credenciales sensibles

---

## Generar JWT SecretKey

### PowerShell (Windows)
```powershell
$bytes = 1..48 | ForEach-Object { Get-Random -Maximum 256 }
[Convert]::ToBase64String($bytes)
```

### Bash (Linux/Mac)
```bash
openssl rand -base64 48
```

---

## Configuración de Gmail SMTP (Opcional)

Solo necesario si vas a probar funcionalidad de emails en desarrollo.

1. Ir a: https://myaccount.google.com/apppasswords
2. Crear nuevo App Password para "Pastisserie API - Dev"
3. Copiar el password generado a `Smtp.Password` en `appsettings.json`

---

## Configuración de SQL Server

### Usando Docker (Recomendado)
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=TuPassword123!" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### Connection String
```json
"DefaultConnection": "Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=TuPassword123!;TrustServerCertificate=True"
```

---

## Migraciones de Base de Datos

```bash
# Crear migración
dotnet ef migrations add MigracionNombre -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API

# Aplicar migración
dotnet ef database update -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API
```

---

## Troubleshooting

### Error: "Could not find appsettings.json"
- Asegúrate de haber copiado `appsettings.Example.json` a `appsettings.json`

### Error: "Login failed for user 'sa'"
- Verifica el password de SQL Server
- Verifica que SQL Server esté corriendo: `docker ps`

### Error: "Invalid JWT SecretKey"
- La clave debe tener al menos 32 caracteres
- Genera una nueva con los comandos de arriba

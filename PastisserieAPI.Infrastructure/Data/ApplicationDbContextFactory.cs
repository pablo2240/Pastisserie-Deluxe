using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PastisserieAPI.Infrastructure.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Connection string hardcoded para migraciones
            optionsBuilder.UseSqlServer(
                // "Server=(localdb)\\mssqllocaldb;Database=PastisserieDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
                "Server=127.0.0.1,1433;Database=PastisserieDB;User Id=sa;Password=DevSql2026!;TrustServerCertificate=True"
            );

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
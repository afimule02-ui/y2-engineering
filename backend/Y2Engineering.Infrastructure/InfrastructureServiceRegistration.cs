using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Infrastructure.Email;
using Y2Engineering.Infrastructure.Jwt;
using Y2Engineering.Infrastructure.Notifications;
using Y2Engineering.Infrastructure.Qr;
using Y2Engineering.Infrastructure.Storage;

namespace Y2Engineering.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IStorageService, LocalStorageService>();
        services.AddScoped<IQrCodeService, QrCodeService>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}

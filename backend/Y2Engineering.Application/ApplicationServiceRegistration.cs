using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Y2Engineering.Application.Services;

namespace Y2Engineering.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(ApplicationServiceRegistration).Assembly);

        services.AddScoped<IServiceRequestService, ServiceRequestService>();
        services.AddScoped<IQuotationService, QuotationService>();

        return services;
    }
}

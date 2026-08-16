using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Interfaces;

namespace Y2Engineering.Persistence.Services;

/// <summary>
/// Generates year-scoped business numbers (e.g. SR-2026-00125) by scanning
/// the latest sequence for the current year. For a production deployment,
/// replace the scan with a dedicated sequence table + row lock.
/// </summary>
public class DbNumberGenerator : INumberGenerator
{
    private readonly ApplicationDbContext _db;

    public DbNumberGenerator(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<string> NextAsync(NumberType type, CancellationToken cancellationToken = default)
    {
        var (prefix, selector) = Map(type);
        var year = DateTime.UtcNow.Year;
        var fullPrefix = $"{prefix}-{year}-";

        var existing = await selector(_db)
            .Where(n => n != null && n.StartsWith(fullPrefix))
            .ToListAsync(cancellationToken);

        var max = existing
            .Select(n => int.TryParse(n[fullPrefix.Length..], out var seq) ? seq : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{fullPrefix}{max + 1:00000}";
    }

    private static (string prefix, Func<ApplicationDbContext, IQueryable<string>> selector) Map(NumberType type)
        => type switch
        {
            NumberType.ServiceRequest => ("SR", db => db.ServiceRequests.Select(x => x.RequestNo)),
            NumberType.Quotation => ("QT", db => db.Quotations.Select(x => x.QuotationNo)),
            NumberType.Invoice => ("INV", db => db.Invoices.Select(x => x.InvoiceNo)),
            NumberType.Payment => ("PAY", db => db.Payments.Select(x => x.PaymentNo)),
            NumberType.WorkOrder => ("WO", db => db.WorkOrders.Select(x => x.WorkOrderNo)),
            NumberType.Project => ("PR", db => db.Projects.Select(x => x.ProjectNo)),
            NumberType.Machine => ("MC", db => db.Machines.Select(x => x.MachineNo)),
            NumberType.Certificate => ("Y2", db => db.Certificates.Select(x => x.CertificateNo)),
            NumberType.Contract => ("CT", db => db.Contracts.Select(x => x.ContractNo)),
            NumberType.Lead => ("LD", db => db.Leads.Select(x => x.LeadNo ?? string.Empty)),
            NumberType.Customer => ("C", db => db.Customers.Select(x => x.CustomerCode ?? string.Empty)),
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown number type.")
        };
}

namespace Y2Engineering.Application.Interfaces;

public enum NumberType
{
    ServiceRequest,
    Quotation,
    Invoice,
    Payment,
    WorkOrder,
    Project,
    Machine,
    Certificate,
    Contract,
    Lead,
    Customer
}

/// <summary>
/// Generates sequential, year-scoped business numbers such as
/// SR-2026-00125 (service request) or QT-2026-00045 (quotation).
/// </summary>
public interface INumberGenerator
{
    Task<string> NextAsync(NumberType type, CancellationToken cancellationToken = default);
}

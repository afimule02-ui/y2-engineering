namespace Y2Engineering.Application.DTOs;

public record StatusCount(int Status, int Count);

public record ReportData(
    int TotalRequests,
    IReadOnlyList<StatusCount> RequestStatuses,
    int TotalQuotations,
    IReadOnlyList<StatusCount> QuotationStatuses,
    decimal TotalRevenue,
    decimal OutstandingBalance,
    int TotalInvoices,
    IReadOnlyList<StatusCount> InvoiceStatuses,
    int TotalProjects,
    IReadOnlyList<StatusCount> ProjectStatuses,
    int TotalMachines,
    IReadOnlyList<StatusCount> MachineStatuses);

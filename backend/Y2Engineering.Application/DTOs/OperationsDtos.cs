using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

// ---------- Training ----------
public record CourseDto(Guid Id, string Title, string Slug, string? Description, string? Category,
    int DurationDays, string? Modules, decimal Price, bool IsActive);

public record CertificateDto(Guid Id, string CertificateNo, string StudentName, string CourseTitle,
    DateTime IssueDate, string? QrCode, bool IsVerified);

// ---------- Staffing ----------
public record VacancyDto(Guid Id, string Title, string? Department, string? Description,
    string? Requirements, string? Location, VacancyStatus Status, DateTime? PostedDate, DateTime? ClosingDate);

public record ApplyVacancyDto(Guid VacancyId, string FirstName, string LastName, string? Email,
    string? Phone, string? Profession, int ExperienceYears, string? Skills, string? Certifications);

public record CandidateDto(Guid Id, string FullName, string? Email, string? Phone, string? Profession,
    int ExperienceYears, string? Skills, string? Certifications, CandidateStatus Status);

public record JobApplicationDto(Guid Id, Guid VacancyId, string VacancyTitle, Guid CandidateId,
    string CandidateName, JobApplicationStatus Status, DateTime AppliedDate);

public record UpdateCandidateStatusDto(CandidateStatus Status, JobApplicationStatus ApplicationStatus);

// ---------- Inventory ----------
public record ProductDto(Guid Id, string Code, string Name, string? Description, string? Category,
    string? Unit, decimal UnitPrice, bool IsActive);

public record StockItemDto(Guid Id, Guid ProductId, string ProductName, string? WarehouseName,
    int Quantity, int ReservedQuantity, int MinStock);

public record WarehouseDto(Guid Id, string Code, string Name, string? Location, bool IsActive);

public record CreateWarehouseDto(string Code, string Name, string? Location);

public record AdjustStockDto(Guid ProductId, Guid WarehouseId, StockTransactionType Type, int Quantity);

// ---------- Finance ----------
public record InvoiceDto(Guid Id, string InvoiceNo, Guid? CustomerId, string? CustomerName,
    DateTime IssueDate, DateTime DueDate, InvoiceStatus Status, decimal Subtotal, decimal TaxAmount,
    decimal Total, decimal PaidAmount, decimal Balance);

public record CreateInvoiceDto(
    Guid? CustomerId,
    Guid? ProjectId,
    Guid? ContractId,
    DateTime IssueDate,
    DateTime DueDate,
    decimal Subtotal,
    decimal TaxRate,
    string? Notes);

public record CreatePaymentDto(Guid InvoiceId, decimal Amount, PaymentMethod Method, string? Reference);

public record PaymentDto(Guid Id, string PaymentNo, Guid? InvoiceId, string? InvoiceNo,
    string? CustomerName, decimal Amount, PaymentMethod Method, PaymentStatus Status,
    DateTime PaymentDate, string? Reference);

// ---------- Dashboard ----------
public record DashboardDto(
    int Customers,
    int ServiceRequests,
    int PendingRequests,
    int Projects,
    int ActiveProjects,
    int Machines,
    int PendingQuotations,
    decimal TotalRevenue,
    IReadOnlyList<ServiceRequestListItemDto> RecentRequests);

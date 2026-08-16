using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

public record QuotationItemDto(Guid Id, string Description, int Quantity, decimal UnitPrice, decimal Total);

public record QuotationDto(
    Guid Id,
    string QuotationNo,
    Guid? CustomerId,
    Guid? ServiceRequestId,
    string Title,
    DateTime IssueDate,
    DateTime ExpiryDate,
    QuotationStatus Status,
    decimal Subtotal,
    decimal Discount,
    decimal TaxRate,
    decimal TaxAmount,
    decimal Total,
    string Currency,
    string? Notes,
    IReadOnlyList<QuotationItemDto> Items);

public record CreateQuotationDto(
    Guid? CustomerId,
    Guid? ServiceRequestId,
    string Title,
    DateTime? ExpiryDate,
    decimal Discount,
    decimal TaxRate,
    string? Notes,
    IReadOnlyList<CreateQuotationItemDto> Items);

public record CreateQuotationItemDto(string Description, int Quantity, decimal UnitPrice);

public record QuotationListItemDto(
    Guid Id,
    string QuotationNo,
    string Title,
    string? CustomerName,
    QuotationStatus Status,
    decimal Total,
    DateTime IssueDate,
    DateTime ExpiryDate);

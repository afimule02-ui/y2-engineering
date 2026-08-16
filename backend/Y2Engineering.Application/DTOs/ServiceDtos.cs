using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

public record ServiceSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Icon,
    string ShortDescription,
    int SortOrder);

public record ServiceDto(
    Guid Id,
    string Name,
    string Slug,
    string? Icon,
    string ShortDescription,
    string Description,
    string? Process,
    string? IndustriesServed,
    string? Faq,
    bool IsActive,
    int SortOrder,
    Guid? CategoryId,
    string? CategoryName,
    string? SeoTitle,
    string? SeoDescription);

public record ServiceCategoryDto(Guid Id, string Name, string Slug, int SortOrder);

public record CreateServiceRequest(string Name, string ShortDescription, string Description, string? Icon,
    string? CategoryId, int SortOrder = 0);

public record UpdateServiceRequest(string? Name, string? ShortDescription, string? Description, string? Icon,
    string? CategoryId, int? SortOrder, bool? IsActive);

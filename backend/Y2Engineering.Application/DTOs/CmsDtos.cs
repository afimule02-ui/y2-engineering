namespace Y2Engineering.Application.DTOs;

public record PageDto(Guid Id, string Title, string Slug, string? Content, bool IsPublished,
    string? MetaTitle, string? MetaDescription, int SortOrder);

public record BlogPostDto(Guid Id, string Title, string Slug, string? Excerpt, string? Content,
    string? Category, string? Tags, bool IsPublished, DateTime? PublishedAt);

public record FaqDto(Guid Id, string Question, string Answer, string? Category, int SortOrder, bool IsActive);

public record TestimonialDto(Guid Id, string CustomerName, string? CompanyName, string Content, int Rating, bool IsActive);

public record MediaAssetDto(Guid Id, string FileName, string FileType, long Size, string StoragePath, string? AltText);

public record CreatePageDto(string Title, string Slug, string? Content, bool IsPublished,
    string? MetaTitle, string? MetaDescription, int SortOrder);

public record CreateBlogPostDto(string Title, string Slug, string? Excerpt, string Content,
    string? Category, string? Tags, bool IsPublished, DateTime? PublishedAt);

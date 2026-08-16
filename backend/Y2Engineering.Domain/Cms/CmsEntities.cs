using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Cms;

/// <summary>
/// A CMS page rendered on the public website (Home, About, Contact, ...).
/// Content is stored in the database so admins can edit without redeploying.
/// </summary>
public class Page : EntityBase
{
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Content { get; set; }

    public bool IsPublished { get; set; } = true;

    public string? MetaTitle { get; set; }

    public string? MetaDescription { get; set; }

    public int SortOrder { get; set; }

    public ICollection<PageSection> Sections { get; set; } = new List<PageSection>();
}

public class PageSection : EntityBase
{
    public Guid PageId { get; set; }

    public Page Page { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string? Subtitle { get; set; }

    public string? Content { get; set; }

    public string SectionType { get; set; } = "text";

    public int SortOrder { get; set; }

    public bool IsVisible { get; set; } = true;
}

/// <summary>
/// Metadata for any uploaded file (image, manual, PDF, drawing, ...).
/// The actual bytes live in object/local file storage, never in SQL Server.
/// </summary>
public class MediaAsset : EntityBase
{
    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public long Size { get; set; }

    public string StoragePath { get; set; } = string.Empty;

    public string? EntityType { get; set; }

    public Guid? EntityId { get; set; }

    public string? AltText { get; set; }
}

public class BlogPost : EntityBase
{
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Excerpt { get; set; }

    public string Content { get; set; } = string.Empty;

    public string? Category { get; set; }

    public string? Tags { get; set; }

    public Guid? AuthorId { get; set; }

    public bool IsPublished { get; set; }

    public DateTime? PublishedAt { get; set; }

    public Guid? CoverImageId { get; set; }

    public string? SeoTitle { get; set; }

    public string? SeoDescription { get; set; }
}

public class Faq : EntityBase
{
    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public string? Category { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}

public class Testimonial : EntityBase
{
    public string CustomerName { get; set; } = string.Empty;

    public string? CompanyName { get; set; }

    public string Content { get; set; } = string.Empty;

    public int Rating { get; set; } = 5;

    public bool IsActive { get; set; } = true;
}

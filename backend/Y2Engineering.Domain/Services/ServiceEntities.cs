using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;

namespace Y2Engineering.Domain.Services;

public class ServiceCategory : EntityBase
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Service> Services { get; set; } = new List<Service>();
}

public class Service : EntityBase
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public string ShortDescription { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Process { get; set; }

    public string? IndustriesServed { get; set; }

    public string? Faq { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }

    public Guid? CategoryId { get; set; }

    public ServiceCategory? Category { get; set; }

    public string? SeoTitle { get; set; }

    public string? SeoDescription { get; set; }

    public ICollection<ServiceRequest> Requests { get; set; } = new List<ServiceRequest>();
}

public class ServiceRequest : EntityBase
{
    public string RequestNo { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? ServiceId { get; set; }

    public Service? Service { get; set; }

    public Guid? MachineId { get; set; }

    public string? MachineName { get; set; }

    public string? MachineManufacturer { get; set; }

    public string? MachineModel { get; set; }

    public string? SerialNumber { get; set; }

    public string ProblemDescription { get; set; } = string.Empty;

    public Priority Priority { get; set; } = Priority.Medium;

    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;

    public DateTime? PreferredDate { get; set; }

    public string? Location { get; set; }

    public string? City { get; set; }

    public string? ContactPerson { get; set; }

    public string? ContactEmail { get; set; }

    public string? ContactPhone { get; set; }

    public Guid? AssignedEngineerId { get; set; }

    public string? Notes { get; set; }

    public ICollection<RequestAttachment> Attachments { get; set; } = new List<RequestAttachment>();
}

/// <summary>
/// Photo/document attached to a service request. The binary lives in file
/// storage; only metadata is stored in the database.
/// </summary>
public class RequestAttachment : EntityBase
{
    public Guid ServiceRequestId { get; set; }

    public ServiceRequest ServiceRequest { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public long Size { get; set; }

    public string StoragePath { get; set; } = string.Empty;
}

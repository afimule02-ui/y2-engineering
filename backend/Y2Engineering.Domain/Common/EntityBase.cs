namespace Y2Engineering.Domain.Common;

/// <summary>
/// Base class shared by every entity in the system. Provides a GUID key
/// and standard audit fields (created/updated timestamps + actors).
/// </summary>
public abstract class EntityBase
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Guid? CreatedBy { get; set; }

    public Guid? UpdatedBy { get; set; }
}

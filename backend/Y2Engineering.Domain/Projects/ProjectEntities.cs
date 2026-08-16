using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Sales;
using Y2Engineering.Domain.Machines;

namespace Y2Engineering.Domain.Projects;

public class Project : EntityBase
{
    public string ProjectNo { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? QuotationId { get; set; }

    public Quotation? Quotation { get; set; }

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.NotStarted;

    public int Progress { get; set; }

    public decimal Budget { get; set; }

    public Guid? ManagerId { get; set; }

    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();

    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

public class ProjectTask : EntityBase
{
    public Guid ProjectId { get; set; }

    public Project Project { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.NotStarted;

    public Guid? AssignedToId { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public int SortOrder { get; set; }
}

public class WorkOrder : EntityBase
{
    public string WorkOrderNo { get; set; } = string.Empty;

    public Guid? ProjectId { get; set; }

    public Project? Project { get; set; }

    public Guid? MachineId { get; set; }

    public Machine? Machine { get; set; }

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ProblemDescription { get; set; } = string.Empty;

    public Priority Priority { get; set; } = Priority.Medium;

    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Open;

    public Guid? AssignedTechnicianId { get; set; }

    public DateTime? ScheduledDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? PartsUsed { get; set; }

    public string? Notes { get; set; }
}

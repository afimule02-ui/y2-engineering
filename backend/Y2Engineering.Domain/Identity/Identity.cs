using Microsoft.AspNetCore.Identity;
using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string? Language { get; set; } = "en";

    public Guid? CompanyId { get; set; }

    public UserStatus Status { get; set; } = UserStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    // Navigation
    public ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
}

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }

    public ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

/// <summary>
/// Explicit join entity for users/roles so role records can also carry
/// audit information. Uses the built-in IdentityUserRole key shape.
/// </summary>
public class ApplicationUserRole : IdentityUserRole<Guid>
{
    public ApplicationUser User { get; set; } = null!;

    public ApplicationRole Role { get; set; } = null!;
}

/// <summary>
/// A single permission in the system, e.g. "Service.Create".
/// Permissions are granted to roles, and users inherit them through their roles.
/// </summary>
public class Permission
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Module { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public Guid RoleId { get; set; }

    public Guid PermissionId { get; set; }

    public ApplicationRole Role { get; set; } = null!;

    public Permission Permission { get; set; } = null!;
}

/// <summary>
/// Central registry of permission names used across the application.
/// Seed data creates a matching DB record for each entry.
/// </summary>
public static class Permissions
{
    public const string UsersView = "Users.View";
    public const string UsersManage = "Users.Manage";

    public const string ServicesView = "Services.View";
    public const string ServicesCreate = "Services.Create";
    public const string ServicesUpdate = "Services.Update";
    public const string ServicesDelete = "Services.Delete";

    public const string ServiceRequestsView = "ServiceRequests.View";
    public const string ServiceRequestsManage = "ServiceRequests.Manage";

    public const string CustomersView = "Customers.View";
    public const string CustomersManage = "Customers.Manage";

    public const string ProjectsView = "Projects.View";
    public const string ProjectsManage = "Projects.Manage";

    public const string MachinesView = "Machines.View";
    public const string MachinesManage = "Machines.Manage";

    public const string QuotationsView = "Quotations.View";
    public const string QuotationsCreate = "Quotations.Create";
    public const string QuotationsApprove = "Quotations.Approve";

    public const string InvoicesView = "Invoices.View";
    public const string InvoicesManage = "Invoices.Manage";

    public const string InventoryView = "Inventory.View";
    public const string InventoryManage = "Inventory.Manage";

    public const string TrainingView = "Training.View";
    public const string TrainingManage = "Training.Manage";

    public const string StaffingView = "Staffing.View";
    public const string StaffingManage = "Staffing.Manage";

    public const string CmsManage = "Cms.Manage";
    public const string ReportsView = "Reports.View";

    public static IReadOnlyList<string> All { get; } = new[]
    {
        UsersView, UsersManage,
        ServicesView, ServicesCreate, ServicesUpdate, ServicesDelete,
        ServiceRequestsView, ServiceRequestsManage,
        CustomersView, CustomersManage,
        ProjectsView, ProjectsManage,
        MachinesView, MachinesManage,
        QuotationsView, QuotationsCreate, QuotationsApprove,
        InvoicesView, InvoicesManage,
        InventoryView, InventoryManage,
        TrainingView, TrainingManage,
        StaffingView, StaffingManage,
        CmsManage, ReportsView
    };
}

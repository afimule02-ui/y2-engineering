using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Domain.Audit;
using Y2Engineering.Domain.Cms;
using Y2Engineering.Domain.Communication;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Finance;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Inventory;
using Y2Engineering.Domain.Machines;
using Y2Engineering.Domain.Projects;
using Y2Engineering.Domain.Sales;
using Y2Engineering.Domain.Services;
using Y2Engineering.Domain.Staffing;
using Y2Engineering.Domain.Training;
using Service = Y2Engineering.Domain.Services.Service;

namespace Y2Engineering.Persistence;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid,
        IdentityUserClaim<Guid>, ApplicationUserRole, IdentityUserLogin<Guid>,
        IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Identity
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    // CRM
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Lead> Leads => Set<Lead>();

    // Services
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<RequestAttachment> RequestAttachments => Set<RequestAttachment>();

    // Projects
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();

    // Machines
    public DbSet<Manufacturer> Manufacturers => Set<Manufacturer>();
    public DbSet<MachineModel> MachineModels => Set<MachineModel>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();

    // Training
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<TrainingClass> TrainingClasses => Set<TrainingClass>();
    public DbSet<Certificate> Certificates => Set<Certificate>();

    // Staffing
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    // Inventory
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();

    // Sales
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationItem> QuotationItems => Set<QuotationItem>();
    public DbSet<Contract> Contracts => Set<Contract>();

    // Finance
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();

    // CMS
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<PageSection> PageSections => Set<PageSection>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();

    // Communication
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ---------- Identity ----------
        builder.Entity<ApplicationUser>().ToTable("Users", "Identity");
        builder.Entity<ApplicationRole>().ToTable("Roles", "Identity");
        builder.Entity<ApplicationUserRole>(b =>
        {
            b.ToTable("UserRoles", "Identity");
            b.HasKey(x => new { x.UserId, x.RoleId });
            // Explicit relationships prevent EF from discovering duplicate FKs
            // next to Identity's own join-table configuration.
            b.HasOne(x => x.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(x => x.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(x => x.RoleId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims", "Identity");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins", "Identity");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims", "Identity");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens", "Identity");

        builder.Entity<Permission>().ToTable("Permissions", "Identity");
        builder.Entity<RolePermission>().ToTable("RolePermissions", "Identity")
            .HasKey(x => new { x.RoleId, x.PermissionId });

        // ---------- CRM ----------
        builder.Entity<Company>().ToTable("Companies", "Crm");
        builder.Entity<Customer>().ToTable("Customers", "Crm");
        builder.Entity<Contact>().ToTable("Contacts", "Crm");
        builder.Entity<Lead>().ToTable("Leads", "Crm");

        // ---------- Services ----------
        builder.Entity<ServiceCategory>().ToTable("Categories", "Services");
        builder.Entity<ServiceCategory>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<Service>().ToTable("Services", "Services");
        builder.Entity<Service>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<ServiceRequest>().ToTable("ServiceRequests", "Services");
        builder.Entity<ServiceRequest>().HasIndex(x => x.RequestNo).IsUnique();
        builder.Entity<RequestAttachment>().ToTable("RequestAttachments", "Services");

        // ---------- Projects ----------
        builder.Entity<Project>().ToTable("Projects", "Projects");
        builder.Entity<Project>().HasIndex(x => x.ProjectNo).IsUnique();
        builder.Entity<ProjectTask>().ToTable("Tasks", "Projects");
        builder.Entity<WorkOrder>().ToTable("WorkOrders", "Projects");
        builder.Entity<WorkOrder>().HasIndex(x => x.WorkOrderNo).IsUnique();

        // ---------- Machines ----------
        builder.Entity<Manufacturer>().ToTable("Manufacturers", "Machines");
        builder.Entity<MachineModel>().ToTable("Models", "Machines");
        builder.Entity<Machine>().ToTable("Machines", "Machines");
        builder.Entity<Machine>().HasIndex(x => x.MachineNo).IsUnique();
        builder.Entity<MaintenanceRecord>().ToTable("MaintenanceRecords", "Machines");

        // ---------- Training ----------
        builder.Entity<Course>().ToTable("Courses", "Training");
        builder.Entity<Course>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<Trainer>().ToTable("Trainers", "Training");
        builder.Entity<Student>().ToTable("Students", "Training");
        builder.Entity<TrainingClass>().ToTable("Classes", "Training");
        builder.Entity<Certificate>().ToTable("Certificates", "Training");
        builder.Entity<Certificate>().HasIndex(x => x.CertificateNo).IsUnique();

        // ---------- Staffing ----------
        builder.Entity<Vacancy>().ToTable("Vacancies", "Staffing");
        builder.Entity<Candidate>().ToTable("Candidates", "Staffing");
        builder.Entity<JobApplication>().ToTable("JobApplications", "Staffing");

        // ---------- Inventory ----------
        builder.Entity<Product>().ToTable("Products", "Inventory");
        builder.Entity<Warehouse>().ToTable("Warehouses", "Inventory");
        builder.Entity<StockItem>().ToTable("StockItems", "Inventory");
        builder.Entity<StockTransaction>().ToTable("StockTransactions", "Inventory");
        builder.Entity<Supplier>().ToTable("Suppliers", "Inventory");

        // ---------- Sales ----------
        builder.Entity<Quotation>().ToTable("Quotations", "Sales");
        builder.Entity<Quotation>().HasIndex(x => x.QuotationNo).IsUnique();
        builder.Entity<QuotationItem>().ToTable("QuotationItems", "Sales");
        builder.Entity<Contract>().ToTable("Contracts", "Sales");
        builder.Entity<Contract>().HasIndex(x => x.ContractNo).IsUnique();

        // ---------- Finance ----------
        builder.Entity<Invoice>().ToTable("Invoices", "Finance");
        builder.Entity<Invoice>().HasIndex(x => x.InvoiceNo).IsUnique();
        builder.Entity<InvoiceItem>().ToTable("InvoiceItems", "Finance");
        builder.Entity<Payment>().ToTable("Payments", "Finance");

        // ---------- CMS ----------
        builder.Entity<Page>().ToTable("Pages", "Cms");
        builder.Entity<Page>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<PageSection>().ToTable("PageSections", "Cms");
        builder.Entity<MediaAsset>().ToTable("MediaAssets", "Cms");
        builder.Entity<BlogPost>().ToTable("BlogPosts", "Cms");
        builder.Entity<BlogPost>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<Faq>().ToTable("Faqs", "Cms");
        builder.Entity<Testimonial>().ToTable("Testimonials", "Cms");

        // ---------- Communication ----------
        builder.Entity<Conversation>().ToTable("Conversations", "Communication");
        builder.Entity<Message>().ToTable("Messages", "Communication");
        builder.Entity<Notification>().ToTable("Notifications", "Communication");

        // ---------- Audit ----------
        builder.Entity<AuditLog>().ToTable("AuditLogs", "Audit");
    }
}

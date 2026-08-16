using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Y2Engineering.Domain.Cms;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Services;
using Service = Y2Engineering.Domain.Services.Service;

namespace Y2Engineering.Persistence.Seed;

public static class DbSeeder
{
    public static readonly string[] Roles =
    {
        "SuperAdmin", "Admin", "Manager", "ProjectManager", "Engineer",
        "Technician", "Accountant", "HR", "Trainer", "Sales", "Customer", "Candidate"
    };

    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();

        await SeedRolesAsync(roleManager);
        await SeedPermissionsAsync(db, roleManager);
        await SeedUsersAsync(userManager);
        await SeedCatalogAsync(db);
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        foreach (var roleName in Roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = roleName,
                    Description = $"System role: {roleName}"
                });
            }
        }
    }

    private static async Task SeedPermissionsAsync(ApplicationDbContext db, RoleManager<ApplicationRole> roleManager)
    {
        foreach (var permissionName in Permissions.All)
        {
            if (!await db.Permissions.AnyAsync(p => p.Name == permissionName))
            {
                var module = permissionName.Split('.')[0];
                db.Permissions.Add(new Permission { Name = permissionName, Module = module });
            }
        }

        await db.SaveChangesAsync();

        // Grant every permission to SuperAdmin.
        var superAdmin = await roleManager.FindByNameAsync("SuperAdmin");
        if (superAdmin is not null)
        {
            var permissionIds = await db.Permissions.Select(p => p.Id).ToListAsync();
            var existing = await db.RolePermissions
                .Where(rp => rp.RoleId == superAdmin.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            foreach (var permissionId in permissionIds.Where(id => !existing.Contains(id)))
            {
                db.RolePermissions.Add(new RolePermission { RoleId = superAdmin.Id, PermissionId = permissionId });
            }

            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        await EnsureUserAsync(userManager, "admin@y2engineering.com", "Y2 Admin", "Admin@123!", "SuperAdmin");
        await EnsureUserAsync(userManager, "customer@y2engineering.com", "Demo Customer", "Customer@123!", "Customer");
        await EnsureUserAsync(userManager, "engineer@y2engineering.com", "Demo Engineer", "Engineer@123!", "Engineer");
    }

    private static async Task EnsureUserAsync(UserManager<ApplicationUser> userManager,
        string email, string fullName, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FullName = fullName
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }

    private static async Task SeedCatalogAsync(ApplicationDbContext db)
    {
        await SeedServicesAsync(db);
        await SeedCmsAsync(db);
        await SeedFaqsAsync(db);
    }

    private static async Task SeedServicesAsync(ApplicationDbContext db)
    {
        if (await db.Services.AnyAsync())
        {
            return;
        }

        var installation = new ServiceCategory { Name = "Installation & Commissioning", Slug = "installation-commissioning", SortOrder = 1 };
        var training = new ServiceCategory { Name = "Training", Slug = "training", SortOrder = 2 };
        var staffing = new ServiceCategory { Name = "Staffing", Slug = "staffing", SortOrder = 3 };
        var repair = new ServiceCategory { Name = "Repair & Maintenance", Slug = "repair-maintenance", SortOrder = 4 };
        var welding = new ServiceCategory { Name = "Welding & Fabrication", Slug = "welding-fabrication", SortOrder = 5 };
        var consulting = new ServiceCategory { Name = "Consulting", Slug = "consulting", SortOrder = 6 };

        db.ServiceCategories.AddRange(installation, training, staffing, repair, welding, consulting);

        db.Services.AddRange(
            new Service
            {
                Name = "Machine Installation & Commissioning",
                Slug = "machine-installation-commissioning",
                Icon = "settings",
                Category = installation,
                ShortDescription = "Professional installation and commissioning of industrial machinery.",
                Description = "Our engineers plan, install and commission industrial machines — from foundations and alignment to electrical connection, testing and handover.",
                Process = "1. Site survey & planning\n2. Foundation & positioning\n3. Mechanical installation\n4. Electrical connection\n5. Testing & commissioning\n6. Operator handover",
                IndustriesServed = "Manufacturing, Food Processing, Construction, Agriculture, Pharmaceutical",
                SortOrder = 1
            },
            new Service
            {
                Name = "Employee Training",
                Slug = "employee-training",
                Icon = "school",
                Category = training,
                ShortDescription = "Technical training programs for machine operators and technicians.",
                Description = "Practical, hands-on training courses covering machine safety, operation, preventive maintenance and troubleshooting — with certificates.",
                SortOrder = 2
            },
            new Service
            {
                Name = "Staffing Solutions",
                Slug = "staffing-solutions",
                Icon = "group",
                Category = staffing,
                ShortDescription = "Skilled workforce supply for startups and existing organizations.",
                Description = "We recruit, vet and supply qualified engineers, technicians and operators for short- and long-term placements.",
                SortOrder = 3
            },
            new Service
            {
                Name = "Machine Repair & Service",
                Slug = "machine-repair-service",
                Icon = "build",
                Category = repair,
                ShortDescription = "Fast, reliable repair and maintenance to minimize downtime.",
                Description = "Emergency repairs, preventive maintenance contracts and scheduled servicing by experienced technicians.",
                SortOrder = 4
            },
            new Service
            {
                Name = "Stainless Steel Welding",
                Slug = "stainless-steel-welding",
                Icon = "whatshot",
                Category = welding,
                ShortDescription = "Certified stainless steel welding and fabrication.",
                Description = "TIG/MIG stainless steel welding, custom fabrication, structural work and sanitary welding for food and pharma.",
                SortOrder = 5
            },
            new Service
            {
                Name = "Quality & Production Consulting",
                Slug = "quality-production-consulting",
                Icon = "insights",
                Category = consulting,
                ShortDescription = "Improve quality systems and production efficiency.",
                Description = "Process audits, quality system setup, production line optimization and continuous improvement consulting.",
                SortOrder = 6
            });

        await db.SaveChangesAsync();
    }

    private static async Task SeedCmsAsync(ApplicationDbContext db)
    {
        if (await db.Pages.AnyAsync())
        {
            return;
        }

        db.Pages.AddRange(
            new Page
            {
                Title = "Home",
                Slug = "home",
                Content = "Y2 Electro Mechanical Engineering delivers installation, training, staffing, repair, welding and consulting services to industry.",
                IsPublished = true,
                MetaTitle = "Y2 Electro Mechanical Engineering | Engineering Solutions for Industry",
                MetaDescription = "Machine installation & commissioning, employee training, staffing solutions, machine repair, stainless steel welding and technical consulting.",
                SortOrder = 1
            },
            new Page
            {
                Title = "About",
                Slug = "about",
                Content = "Y2 Electro Mechanical Engineering is a full-service engineering company serving industrial clients.",
                IsPublished = true,
                SortOrder = 2
            },
            new Page
            {
                Title = "Contact",
                Slug = "contact",
                Content = "Reach out for a service request, quotation or technical consultation.",
                IsPublished = true,
                SortOrder = 3
            });

        await db.SaveChangesAsync();
    }

    private static async Task SeedFaqsAsync(ApplicationDbContext db)
    {
        if (await db.Faqs.AnyAsync())
        {
            return;
        }

        db.Faqs.AddRange(
            new Faq { Question = "How do I request a service?", Answer = "Fill in the Request Service form and our team will contact you within one business day.", Category = "General", SortOrder = 1 },
            new Faq { Question = "How long does a quotation take?", Answer = "Most quotations are issued within 1–3 business days after a site visit or machine assessment.", Category = "Quotations", SortOrder = 2 },
            new Faq { Question = "Do you provide training certificates?", Answer = "Yes. Every training program ends with an assessment and a verifiable certificate.", Category = "Training", SortOrder = 3 });

        await db.SaveChangesAsync();
    }
}

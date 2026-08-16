using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Crm;

public class Company : EntityBase
{
    public string Name { get; set; } = string.Empty;

    public string? RegistrationNo { get; set; }

    public string? Industry { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; } = "Ethiopia";

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Website { get; set; }

    public string? Notes { get; set; }

    public ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}

public class Customer : EntityBase
{
    public string? CustomerCode { get; set; }

    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public string ContactPerson { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? City { get; set; }

    public string? Address { get; set; }

    public Guid? UserAccountId { get; set; }

    public bool IsActive { get; set; } = true;

    public string? Notes { get; set; }

    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}

public class Contact : EntityBase
{
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Position { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool IsPrimary { get; set; }
}

public class Lead : EntityBase
{
    public string? LeadNo { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? ContactPerson { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? InterestedService { get; set; }

    public LeadSource Source { get; set; } = LeadSource.Website;

    public LeadStatus Status { get; set; } = LeadStatus.New;

    public Guid? AssignedToId { get; set; }

    public string? Notes { get; set; }
}

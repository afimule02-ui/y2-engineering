using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Staffing;

public class Vacancy : EntityBase
{
    public string Title { get; set; } = string.Empty;

    public string? Department { get; set; }

    public string? Description { get; set; }

    public string? Requirements { get; set; }

    public string? Location { get; set; }

    public VacancyStatus Status { get; set; } = VacancyStatus.Open;

    public DateTime? PostedDate { get; set; }

    public DateTime? ClosingDate { get; set; }

    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}

public class Candidate : EntityBase
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Profession { get; set; }

    public int ExperienceYears { get; set; }

    public string? Skills { get; set; }

    public string? Certifications { get; set; }

    public string? CvPath { get; set; }

    public CandidateStatus Status { get; set; } = CandidateStatus.New;

    public string? Notes { get; set; }

    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}

public class JobApplication : EntityBase
{
    public Guid VacancyId { get; set; }

    public Vacancy Vacancy { get; set; } = null!;

    public Guid CandidateId { get; set; }

    public Candidate Candidate { get; set; } = null!;

    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Submitted;

    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }
}

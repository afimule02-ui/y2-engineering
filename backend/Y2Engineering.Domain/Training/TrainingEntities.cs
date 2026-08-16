using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Training;

public class Course : EntityBase
{
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public int DurationDays { get; set; }

    public string? Modules { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<TrainingClass> Classes { get; set; } = new List<TrainingClass>();
}

public class Trainer : EntityBase
{
    public Guid? UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Specialization { get; set; }

    public string? Bio { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }
}

public class Student : EntityBase
{
    public Guid? UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? CompanyName { get; set; }

    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}

public class TrainingClass : EntityBase
{
    public Guid CourseId { get; set; }

    public Course Course { get; set; } = null!;

    public Guid? TrainerId { get; set; }

    public Trainer? Trainer { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? Location { get; set; }

    public int MaxStudents { get; set; } = 20;
}

public class Certificate : EntityBase
{
    public string CertificateNo { get; set; } = string.Empty;

    public Guid StudentId { get; set; }

    public Student Student { get; set; } = null!;

    public Guid CourseId { get; set; }

    public Course Course { get; set; } = null!;

    public DateTime IssueDate { get; set; }

    public string? QrCode { get; set; }

    public bool IsVerified { get; set; }
}

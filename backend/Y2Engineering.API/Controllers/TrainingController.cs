using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Training;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/training")]
public class TrainingController : ControllerBase
{
    private readonly IRepository<Course> _courses;
    private readonly IRepository<Certificate> _certificates;

    public TrainingController(IRepository<Course> courses, IRepository<Certificate> certificates)
    {
        _courses = courses;
        _certificates = certificates;
    }

    [HttpGet("certificates")]
    [Authorize(Policy = Permissions.TrainingView)]
    public async Task<ActionResult<List<CertificateDto>>> Certificates(CancellationToken ct)
    {
        var certificates = await _certificates.Query()
            .Include(c => c.Student)
            .Include(c => c.Course)
            .OrderByDescending(c => c.IssueDate)
            .Select(c => new CertificateDto(
                c.Id, c.CertificateNo, c.Student.FullName, c.Course.Title, c.IssueDate, c.QrCode, c.IsVerified))
            .ToListAsync(ct);

        return Ok(certificates);
    }

    [HttpGet("courses")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CourseDto>>> Courses(CancellationToken ct)
    {
        var courses = await _courses.Query()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Title)
            .Select(c => new CourseDto(
                c.Id, c.Title, c.Slug, c.Description, c.Category, c.DurationDays, c.Modules, c.Price, c.IsActive))
            .ToListAsync(ct);

        return Ok(courses);
    }

    [HttpPost("courses")]
    [Authorize(Policy = Permissions.TrainingManage)]
    public async Task<ActionResult<CourseDto>> CreateCourse(CourseDto dto, CancellationToken ct)
    {
        var course = new Course
        {
            Title = dto.Title,
            Slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? Application.Common.SlugHelper.Generate(dto.Title)
                : dto.Slug,
            Description = dto.Description,
            Category = dto.Category,
            DurationDays = dto.DurationDays,
            Modules = dto.Modules,
            Price = dto.Price,
            IsActive = dto.IsActive
        };

        await _courses.AddAsync(course, ct);
        await _courses.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Courses), new CourseDto(
            course.Id, course.Title, course.Slug, course.Description, course.Category,
            course.DurationDays, course.Modules, course.Price, course.IsActive));
    }

    /// <summary>
    /// Public certificate verification page: /verify-certificate/Y2-2026-00001
    /// calls this endpoint to confirm a certificate is genuine.
    /// </summary>
    [HttpGet("certificates/{certificateNo}")]
    [AllowAnonymous]
    public async Task<ActionResult<CertificateDto>> VerifyCertificate(string certificateNo, CancellationToken ct)
    {
        var certificate = await _certificates.Query()
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Where(c => c.CertificateNo == certificateNo)
            .Select(c => new CertificateDto(
                c.Id, c.CertificateNo, c.Student.FullName, c.Course.Title, c.IssueDate, c.QrCode, c.IsVerified))
            .FirstOrDefaultAsync(ct);

        if (certificate is null)
        {
            return NotFound(new { error = "Certificate not found." });
        }

        return Ok(certificate);
    }
}

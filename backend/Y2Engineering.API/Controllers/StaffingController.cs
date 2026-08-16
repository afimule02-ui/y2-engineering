using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Staffing;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/staffing")]
public class StaffingController : ControllerBase
{
    private readonly IRepository<Vacancy> _vacancies;
    private readonly IRepository<Candidate> _candidates;
    private readonly IRepository<JobApplication> _applications;

    public StaffingController(
        IRepository<Vacancy> vacancies,
        IRepository<Candidate> candidates,
        IRepository<JobApplication> applications)
    {
        _vacancies = vacancies;
        _candidates = candidates;
        _applications = applications;
    }

    [HttpGet("vacancies")]
    [AllowAnonymous]
    public async Task<ActionResult<List<VacancyDto>>> Vacancies(CancellationToken ct)
    {
        var vacancies = await _vacancies.Query()
            .Where(v => v.Status == Domain.Common.VacancyStatus.Open)
            .OrderByDescending(v => v.PostedDate)
            .Select(v => new VacancyDto(
                v.Id, v.Title, v.Department, v.Description, v.Requirements, v.Location,
                v.Status, v.PostedDate, v.ClosingDate))
            .ToListAsync(ct);

        return Ok(vacancies);
    }

    [HttpPost("vacancies")]
    [Authorize(Policy = Permissions.StaffingManage)]
    public async Task<ActionResult<VacancyDto>> CreateVacancy(VacancyDto dto, CancellationToken ct)
    {
        var vacancy = new Vacancy
        {
            Title = dto.Title,
            Department = dto.Department,
            Description = dto.Description,
            Requirements = dto.Requirements,
            Location = dto.Location,
            Status = dto.Status,
            PostedDate = dto.PostedDate ?? DateTime.UtcNow,
            ClosingDate = dto.ClosingDate
        };

        await _vacancies.AddAsync(vacancy, ct);
        await _vacancies.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Vacancies), new VacancyDto(
            vacancy.Id, vacancy.Title, vacancy.Department, vacancy.Description, vacancy.Requirements,
            vacancy.Location, vacancy.Status, vacancy.PostedDate, vacancy.ClosingDate));
    }

    [HttpGet("candidates")]
    [Authorize(Policy = Permissions.StaffingView)]
    public async Task<ActionResult<List<CandidateDto>>> Candidates(CancellationToken ct)
    {
        var candidates = await _candidates.Query()
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CandidateDto(
                c.Id, $"{c.FirstName} {c.LastName}", c.Email, c.Phone, c.Profession,
                c.ExperienceYears, c.Skills, c.Certifications, c.Status))
            .ToListAsync(ct);

        return Ok(candidates);
    }

    [HttpGet("applications")]
    [Authorize(Policy = Permissions.StaffingView)]
    public async Task<ActionResult<List<JobApplicationDto>>> Applications(CancellationToken ct)
    {
        var applications = await _applications.Query()
            .Include(a => a.Vacancy)
            .Include(a => a.Candidate)
            .OrderByDescending(a => a.AppliedDate)
            .Select(a => new JobApplicationDto(
                a.Id, a.VacancyId, a.Vacancy.Title, a.CandidateId,
                $"{a.Candidate.FirstName} {a.Candidate.LastName}", a.Status, a.AppliedDate))
            .ToListAsync(ct);

        return Ok(applications);
    }

    [HttpPut("candidates/{id:guid}")]
    [Authorize(Policy = Permissions.StaffingManage)]
    public async Task<IActionResult> UpdateCandidateStatus(Guid id, UpdateCandidateStatusDto dto, CancellationToken ct)
    {
        var candidate = await _candidates.GetByIdAsync(id, ct);
        if (candidate is null)
        {
            return NotFound();
        }

        candidate.Status = dto.Status;
        candidate.UpdatedAt = DateTime.UtcNow;
        await _candidates.SaveChangesAsync(ct);

        var application = await _applications.Query()
            .FirstOrDefaultAsync(a => a.CandidateId == id, ct);
        if (application is not null)
        {
            application.Status = dto.ApplicationStatus;
            await _applications.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpPost("applications")]
    [AllowAnonymous]
    public async Task<IActionResult> Apply(ApplyVacancyDto dto, CancellationToken ct)
    {
        var vacancy = await _vacancies.GetByIdAsync(dto.VacancyId, ct);
        if (vacancy is null || vacancy.Status != Domain.Common.VacancyStatus.Open)
        {
            return BadRequest(new { error = "This vacancy is not open for applications." });
        }

        var candidate = new Candidate
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Profession = dto.Profession,
            ExperienceYears = dto.ExperienceYears,
            Skills = dto.Skills,
            Certifications = dto.Certifications
        };

        await _candidates.AddAsync(candidate, ct);
        await _candidates.SaveChangesAsync(ct);

        await _applications.AddAsync(new JobApplication
        {
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            Status = Domain.Common.JobApplicationStatus.Submitted
        }, ct);

        await _applications.SaveChangesAsync(ct);

        return Ok(new { message = "Application submitted successfully." });
    }
}

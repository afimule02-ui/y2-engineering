using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Projects;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize(Policy = Permissions.ProjectsView)]
public class ProjectsController : ControllerBase
{
    private readonly IRepository<Project> _projects;
    private readonly IRepository<ProjectTask> _tasks;
    private readonly INumberGenerator _numbers;

    public ProjectsController(
        IRepository<Project> projects,
        IRepository<ProjectTask> tasks,
        INumberGenerator numbers)
    {
        _projects = projects;
        _tasks = tasks;
        _numbers = numbers;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> List(CancellationToken ct)
    {
        var projects = await _projects.Query()
            .Include(p => p.Customer)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto(
                p.Id, p.ProjectNo, p.Name, p.CustomerId, p.Customer != null ? p.Customer.ContactPerson : null,
                p.Description, p.StartDate, p.EndDate, p.Status, p.Progress, p.Budget))
            .ToListAsync(ct);

        return Ok(projects);
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectDto>>> PublicList(CancellationToken ct)
    {
        var projects = await _projects.Query()
            .Where(p => p.Status != Domain.Common.ProjectStatus.Cancelled)
            .Include(p => p.Customer)
            .OrderByDescending(p => p.StartDate)
            .Select(p => new ProjectDto(
                p.Id, p.ProjectNo, p.Name, p.CustomerId, p.Customer != null ? p.Customer.ContactPerson : null,
                p.Description, p.StartDate, p.EndDate, p.Status, p.Progress, p.Budget))
            .ToListAsync(ct);

        return Ok(projects);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> Get(Guid id, CancellationToken ct)
    {
        var project = await _projects.Query()
            .Include(p => p.Customer)
            .Where(p => p.Id == id)
            .Select(p => new ProjectDto(
                p.Id, p.ProjectNo, p.Name, p.CustomerId, p.Customer != null ? p.Customer.ContactPerson : null,
                p.Description, p.StartDate, p.EndDate, p.Status, p.Progress, p.Budget))
            .FirstOrDefaultAsync(ct);

        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.ProjectsManage)]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectDto dto, CancellationToken ct)
    {
        var project = new Project
        {
            ProjectNo = await _numbers.NextAsync(NumberType.Project, ct),
            Name = dto.Name,
            CustomerId = dto.CustomerId,
            QuotationId = dto.QuotationId,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = dto.Status,
            Progress = dto.Progress,
            Budget = dto.Budget
        };

        await _projects.AddAsync(project, ct);
        await _projects.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = project.Id }, ToDto(project));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.ProjectsManage)]
    public async Task<IActionResult> Update(Guid id, CreateProjectDto dto, CancellationToken ct)
    {
        var project = await _projects.GetByIdAsync(id, ct);
        if (project is null)
        {
            return NotFound();
        }

        project.Name = dto.Name;
        project.CustomerId = dto.CustomerId;
        project.QuotationId = dto.QuotationId;
        project.Description = dto.Description;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.Status = dto.Status;
        project.Progress = dto.Progress;
        project.Budget = dto.Budget;
        project.UpdatedAt = DateTime.UtcNow;

        await _projects.SaveChangesAsync(ct);
        return Ok(ToDto(project));
    }

    [HttpGet("{id:guid}/tasks")]
    public async Task<ActionResult<List<ProjectTaskDto>>> Tasks(Guid id, CancellationToken ct)
    {
        var tasks = await _tasks.Query()
            .Where(t => t.ProjectId == id)
            .OrderBy(t => t.SortOrder)
            .Select(t => new ProjectTaskDto(
                t.Id, t.ProjectId, t.Title, t.Description, t.Status, t.DueDate, t.CompletedAt, t.SortOrder))
            .ToListAsync(ct);

        return Ok(tasks);
    }

    [HttpPost("{id:guid}/tasks")]
    [Authorize(Policy = Permissions.ProjectsManage)]
    public async Task<ActionResult<ProjectTaskDto>> AddTask(Guid id, ProjectTaskDto dto, CancellationToken ct)
    {
        if (await _projects.GetByIdAsync(id, ct) is null)
        {
            return NotFound();
        }

        var task = new ProjectTask
        {
            ProjectId = id,
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            DueDate = dto.DueDate,
            SortOrder = dto.SortOrder
        };

        await _tasks.AddAsync(task, ct);
        await _tasks.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Tasks), new { id }, new ProjectTaskDto(
            task.Id, task.ProjectId, task.Title, task.Description, task.Status, task.DueDate, task.CompletedAt, task.SortOrder));
    }

    private static ProjectDto ToDto(Project p) => new(
        p.Id, p.ProjectNo, p.Name, p.CustomerId, null, p.Description, p.StartDate,
        p.EndDate, p.Status, p.Progress, p.Budget);
}

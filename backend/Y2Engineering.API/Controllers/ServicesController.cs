using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Common;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Service = Y2Engineering.Domain.Services.Service;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IRepository<Service> _services;

    public ServicesController(IRepository<Service> services)
    {
        _services = services;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ServiceSummaryDto>>> List(CancellationToken ct)
    {
        var services = await _services.Query()
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .Select(s => new ServiceSummaryDto(s.Id, s.Name, s.Slug, s.Icon, s.ShortDescription, s.SortOrder))
            .ToListAsync(ct);

        return Ok(services);
    }

    [HttpGet("manage")]
    [Authorize(Policy = Permissions.ServicesView)]
    public async Task<ActionResult<List<ServiceDto>>> ListAll(CancellationToken ct)
    {
        var services = await _services.Query()
            .Include(s => s.Category)
            .OrderBy(s => s.SortOrder)
            .Select(s => new ServiceDto(
                s.Id, s.Name, s.Slug, s.Icon, s.ShortDescription, s.Description, s.Process,
                s.IndustriesServed, s.Faq, s.IsActive, s.SortOrder, s.CategoryId,
                s.Category != null ? s.Category.Name : null, s.SeoTitle, s.SeoDescription))
            .ToListAsync(ct);

        return Ok(services);
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServiceDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var service = await _services.Query()
            .Include(s => s.Category)
            .Where(s => s.Slug == slug)
            .Select(s => new ServiceDto(
                s.Id, s.Name, s.Slug, s.Icon, s.ShortDescription, s.Description, s.Process,
                s.IndustriesServed, s.Faq, s.IsActive, s.SortOrder, s.CategoryId,
                s.Category != null ? s.Category.Name : null, s.SeoTitle, s.SeoDescription))
            .FirstOrDefaultAsync(ct);

        return service is null ? NotFound() : Ok(service);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.ServicesCreate)]
    public async Task<ActionResult<ServiceDto>> Create(CreateServiceRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Service name is required." });
        }

        var slug = await UniqueSlugAsync(SlugHelper.Generate(request.Name), ct);

        var service = new Service
        {
            Name = request.Name,
            Slug = slug,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            Icon = request.Icon,
            CategoryId = Guid.TryParse(request.CategoryId, out var categoryId) ? categoryId : null,
            SortOrder = request.SortOrder,
            IsActive = true,
            SeoTitle = request.Name,
            SeoDescription = request.ShortDescription
        };

        await _services.AddAsync(service, ct);
        await _services.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetBySlug), new { slug = service.Slug }, ToDto(service));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.ServicesUpdate)]
    public async Task<IActionResult> Update(Guid id, UpdateServiceRequest request, CancellationToken ct)
    {
        var service = await _services.GetByIdAsync(id, ct);
        if (service is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            service.Name = request.Name;
            service.Slug = await UniqueSlugAsync(SlugHelper.Generate(request.Name), ct, service.Id);
        }

        if (request.ShortDescription is not null) service.ShortDescription = request.ShortDescription;
        if (request.Description is not null) service.Description = request.Description;
        if (request.Icon is not null) service.Icon = request.Icon;
        if (request.CategoryId is not null)
            service.CategoryId = Guid.TryParse(request.CategoryId, out var categoryId) ? categoryId : null;
        if (request.SortOrder is not null) service.SortOrder = request.SortOrder.Value;
        if (request.IsActive is not null) service.IsActive = request.IsActive.Value;

        service.UpdatedAt = DateTime.UtcNow;
        await _services.SaveChangesAsync(ct);

        return Ok(ToDto(service));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.ServicesDelete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var service = await _services.GetByIdAsync(id, ct);
        if (service is null)
        {
            return NotFound();
        }

        _services.Remove(service);
        await _services.SaveChangesAsync(ct);

        return NoContent();
    }

    private async Task<string> UniqueSlugAsync(string baseSlug, CancellationToken ct, Guid? excludeId = null)
    {
        var slug = baseSlug;
        var suffix = 2;

        while (await _services.Query().AnyAsync(s => s.Slug == slug && s.Id != excludeId, ct))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static ServiceDto ToDto(Service s) => new(
        s.Id, s.Name, s.Slug, s.Icon, s.ShortDescription, s.Description, s.Process,
        s.IndustriesServed, s.Faq, s.IsActive, s.SortOrder, s.CategoryId, null,
        s.SeoTitle, s.SeoDescription);
}

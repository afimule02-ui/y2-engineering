using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Application.Services;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/service-requests")]
public class ServiceRequestsController : ControllerBase
{
    private readonly IServiceRequestService _service;
    private readonly ICurrentUser _currentUser;
    private readonly IRepository<Customer> _customers;
    private readonly IValidator<CreateServiceRequestDto> _validator;

    public ServiceRequestsController(
        IServiceRequestService service,
        ICurrentUser currentUser,
        IRepository<Customer> customers,
        IValidator<CreateServiceRequestDto> validator)
    {
        _service = service;
        _currentUser = currentUser;
        _customers = customers;
        _validator = validator;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ServiceRequestListItemDto>> Create(CreateServiceRequestDto dto, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var created = await _service.CreateAsync(dto, _currentUser.UserId, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpGet]
    [Authorize(Policy = Permissions.ServiceRequestsView)]
    public async Task<ActionResult<List<ServiceRequestListItemDto>>> List(CancellationToken ct)
        => Ok(await _service.ListAllAsync(ct));

    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<ServiceRequestListItemDto>>> Mine(CancellationToken ct)
    {
        if (_currentUser.UserId is null)
        {
            return Ok(new List<ServiceRequestListItemDto>());
        }

        var customer = await _customers.Query()
            .FirstOrDefaultAsync(c => c.UserAccountId == _currentUser.UserId, ct);

        if (customer is null)
        {
            return Ok(new List<ServiceRequestListItemDto>());
        }

        return Ok(await _service.ListForCustomerAsync(customer.Id, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.ServiceRequestsView)]
    public async Task<ActionResult<ServiceRequestListItemDto>> Get(Guid id, CancellationToken ct)
    {
        var request = await _service.GetAsync(id, ct);
        return request is null ? NotFound() : Ok(request);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Policy = Permissions.ServiceRequestsManage)]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateServiceRequestStatusDto dto, CancellationToken ct)
    {
        await _service.UpdateStatusAsync(id, dto.Status, dto.Notes, ct);
        return NoContent();
    }
}

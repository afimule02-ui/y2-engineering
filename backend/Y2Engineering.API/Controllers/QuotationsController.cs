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
[Route("api/quotations")]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _service;
    private readonly ICurrentUser _currentUser;
    private readonly IRepository<Customer> _customers;
    private readonly IValidator<CreateQuotationDto> _validator;

    public QuotationsController(
        IQuotationService service,
        ICurrentUser currentUser,
        IRepository<Customer> customers,
        IValidator<CreateQuotationDto> validator)
    {
        _service = service;
        _currentUser = currentUser;
        _customers = customers;
        _validator = validator;
    }

    [HttpPost]
    [Authorize(Policy = Permissions.QuotationsCreate)]
    public async Task<ActionResult<QuotationDto>> Create(CreateQuotationDto dto, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var quotation = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(Get), new { id = quotation.Id }, quotation);
    }

    [HttpGet]
    [Authorize(Policy = Permissions.QuotationsView)]
    public async Task<ActionResult<List<QuotationListItemDto>>> List(CancellationToken ct)
        => Ok(await _service.ListAllAsync(ct));

    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<QuotationListItemDto>>> Mine(CancellationToken ct)
    {
        if (_currentUser.UserId is null)
        {
            return Ok(new List<QuotationListItemDto>());
        }

        var customer = await _customers.Query()
            .FirstOrDefaultAsync(c => c.UserAccountId == _currentUser.UserId, ct);

        if (customer is null)
        {
            return Ok(new List<QuotationListItemDto>());
        }

        return Ok(await _service.ListForCustomerAsync(customer.Id, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.QuotationsView)]
    public async Task<ActionResult<QuotationDto>> Get(Guid id, CancellationToken ct)
    {
        var quotation = await _service.GetAsync(id, ct);
        return quotation is null ? NotFound() : Ok(quotation);
    }

    [HttpPost("{id:guid}/accept")]
    [Authorize]
    public async Task<IActionResult> Accept(Guid id, CancellationToken ct)
    {
        await _service.AcceptAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        await _service.RejectAsync(id, ct);
        return NoContent();
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Policy = Permissions.CustomersView)]
public class CustomersController : ControllerBase
{
    private readonly IRepository<Customer> _customers;

    public CustomersController(IRepository<Customer> customers)
    {
        _customers = customers;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> List(CancellationToken ct)
    {
        var customers = await _customers.Query()
            .Include(c => c.Company)
            .OrderBy(c => c.ContactPerson)
            .Select(c => new CustomerDto(
                c.Id, c.CustomerCode ?? string.Empty, c.CompanyId, c.Company != null ? c.Company.Name : null,
                c.ContactPerson, c.Email, c.Phone, c.City, c.Address, c.IsActive, c.Notes))
            .ToListAsync(ct);

        return Ok(customers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> Get(Guid id, CancellationToken ct)
    {
        var customer = await _customers.Query()
            .Include(c => c.Company)
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto(
                c.Id, c.CustomerCode ?? string.Empty, c.CompanyId, c.Company != null ? c.Company.Name : null,
                c.ContactPerson, c.Email, c.Phone, c.City, c.Address, c.IsActive, c.Notes))
            .FirstOrDefaultAsync(ct);

        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CustomersManage)]
    public async Task<ActionResult<CustomerDto>> Create(CreateCustomerDto dto, CancellationToken ct)
    {
        var customer = new Customer
        {
            CustomerCode = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
            CompanyId = Guid.TryParse(dto.CompanyId, out var companyId) ? companyId : null,
            ContactPerson = dto.ContactPerson,
            Email = dto.Email,
            Phone = dto.Phone,
            City = dto.City,
            Address = dto.Address,
            Notes = dto.Notes,
            IsActive = true
        };

        await _customers.AddAsync(customer, ct);
        await _customers.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = customer.Id }, ToDto(customer));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.CustomersManage)]
    public async Task<IActionResult> Update(Guid id, CreateCustomerDto dto, CancellationToken ct)
    {
        var customer = await _customers.GetByIdAsync(id, ct);
        if (customer is null)
        {
            return NotFound();
        }

        customer.CompanyId = Guid.TryParse(dto.CompanyId, out var companyId) ? companyId : null;
        customer.ContactPerson = dto.ContactPerson;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.City = dto.City;
        customer.Address = dto.Address;
        customer.Notes = dto.Notes;
        customer.UpdatedAt = DateTime.UtcNow;

        await _customers.SaveChangesAsync(ct);
        return Ok(ToDto(customer));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.CustomersManage)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var customer = await _customers.GetByIdAsync(id, ct);
        if (customer is null)
        {
            return NotFound();
        }

        _customers.Remove(customer);
        await _customers.SaveChangesAsync(ct);
        return NoContent();
    }

    private static CustomerDto ToDto(Customer c) => new(
        c.Id, c.CustomerCode ?? string.Empty, c.CompanyId, null, c.ContactPerson,
        c.Email, c.Phone, c.City, c.Address, c.IsActive, c.Notes);
}

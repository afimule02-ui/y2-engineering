using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize(Policy = Permissions.CustomersView)]
public class CompaniesController : ControllerBase
{
    private readonly IRepository<Company> _companies;

    public CompaniesController(IRepository<Company> companies)
    {
        _companies = companies;
    }

    [HttpGet]
    public async Task<ActionResult<List<CompanyDto>>> List(CancellationToken ct)
    {
        var companies = await _companies.Query()
            .OrderBy(c => c.Name)
            .Select(c => new CompanyDto(
                c.Id, c.Name, c.RegistrationNo, c.Industry, c.City, c.Country, c.Phone, c.Email, c.Website))
            .ToListAsync(ct);

        return Ok(companies);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CustomersManage)]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto dto, CancellationToken ct)
    {
        var company = new Company
        {
            Name = dto.Name,
            RegistrationNo = dto.RegistrationNo,
            Industry = dto.Industry,
            City = dto.City,
            Country = dto.Country,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website
        };

        await _companies.AddAsync(company, ct);
        await _companies.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), new CompanyDto(
            company.Id, company.Name, company.RegistrationNo, company.Industry, company.City,
            company.Country, company.Phone, company.Email, company.Website));
    }
}

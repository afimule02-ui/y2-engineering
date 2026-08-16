using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Application.Services;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Finance;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Machines;
using Y2Engineering.Domain.Projects;
using Y2Engineering.Domain.Sales;
using Y2Engineering.Domain.Services;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = Permissions.ReportsView)]
public class AdminController : ControllerBase
{
    private readonly IRepository<Customer> _customers;
    private readonly IRepository<ServiceRequest> _requests;
    private readonly IRepository<Project> _projects;
    private readonly IRepository<Machine> _machines;
    private readonly IRepository<Quotation> _quotations;
    private readonly IRepository<Payment> _payments;
    private readonly IRepository<Invoice> _invoices;
    private readonly IServiceRequestService _requestService;

    public AdminController(
        IRepository<Customer> customers,
        IRepository<ServiceRequest> requests,
        IRepository<Project> projects,
        IRepository<Machine> machines,
        IRepository<Quotation> quotations,
        IRepository<Payment> payments,
        IRepository<Invoice> invoices,
        IServiceRequestService requestService)
    {
        _customers = customers;
        _requests = requests;
        _projects = projects;
        _machines = machines;
        _quotations = quotations;
        _payments = payments;
        _invoices = invoices;
        _requestService = requestService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard(CancellationToken ct)
    {
        var customerCount = await _customers.CountAsync(ct);
        var requestCount = await _requests.CountAsync(ct);
        var pendingRequests = await _requests.Query().CountAsync(r => r.Status == ServiceRequestStatus.Pending, ct);
        var projectCount = await _projects.CountAsync(ct);
        var activeProjects = await _projects.Query().CountAsync(p => p.Status == ProjectStatus.InProgress, ct);
        var machineCount = await _machines.CountAsync(ct);
        var pendingQuotations = await _quotations.Query().CountAsync(q => q.Status == QuotationStatus.Sent, ct);
        var totalRevenue = await _payments.Query()
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var recentRequests = await _requestService.ListAllAsync(ct);

        return Ok(new DashboardDto(
            customerCount, requestCount, pendingRequests, projectCount, activeProjects,
            machineCount, pendingQuotations, totalRevenue, recentRequests.Take(8).ToList()));
    }

    [HttpGet("reports")]
    public async Task<ActionResult<ReportData>> Reports(CancellationToken ct)
    {
        var requestStatuses = await _requests.Query()
            .GroupBy(r => r.Status)
            .Select(g => new StatusCount((int)g.Key, g.Count()))
            .ToListAsync(ct);
        var requestTotal = requestStatuses.Sum(s => s.Count);

        var quotationStatuses = await _quotations.Query()
            .GroupBy(q => q.Status)
            .Select(g => new StatusCount((int)g.Key, g.Count()))
            .ToListAsync(ct);
        var quotationTotal = quotationStatuses.Sum(s => s.Count);

        var invoiceStatuses = await _invoices.Query()
            .GroupBy(i => i.Status)
            .Select(g => new StatusCount((int)g.Key, g.Count()))
            .ToListAsync(ct);
        var invoiceTotal = invoiceStatuses.Sum(s => s.Count);

        var projectStatuses = await _projects.Query()
            .GroupBy(p => p.Status)
            .Select(g => new StatusCount((int)g.Key, g.Count()))
            .ToListAsync(ct);
        var projectTotal = projectStatuses.Sum(s => s.Count);

        var machineStatuses = await _machines.Query()
            .GroupBy(m => m.Status)
            .Select(g => new StatusCount((int)g.Key, g.Count()))
            .ToListAsync(ct);
        var machineTotal = machineStatuses.Sum(s => s.Count);

        var totalRevenue = await _payments.Query()
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var outstanding = await _invoices.Query()
            .Where(i => i.Status == InvoiceStatus.Sent
                || i.Status == InvoiceStatus.PartialPaid
                || i.Status == InvoiceStatus.Overdue)
            .SumAsync(i => (decimal?)i.Balance, ct) ?? 0m;

        return Ok(new ReportData(
            requestTotal, requestStatuses,
            quotationTotal, quotationStatuses,
            totalRevenue, outstanding,
            invoiceTotal, invoiceStatuses,
            projectTotal, projectStatuses,
            machineTotal, machineStatuses));
    }
}

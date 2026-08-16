using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Projects;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/work-orders")]
[Authorize(Policy = Permissions.ProjectsView)]
public class WorkOrdersController : ControllerBase
{
    private readonly IRepository<WorkOrder> _workOrders;
    private readonly INumberGenerator _numbers;

    public WorkOrdersController(IRepository<WorkOrder> workOrders, INumberGenerator numbers)
    {
        _workOrders = workOrders;
        _numbers = numbers;
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkOrderDto>>> List(CancellationToken ct)
    {
        var workOrders = await _workOrders.Query()
            .Include(w => w.Machine)
            .Include(w => w.Customer)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WorkOrderDto(
                w.Id, w.WorkOrderNo, w.ProjectId, w.MachineId,
                w.Machine != null ? w.Machine.MachineNo : null,
                w.CustomerId, w.Customer != null ? w.Customer.ContactPerson : null,
                w.Title, w.ProblemDescription, w.Priority, w.Status, w.ScheduledDate, w.CompletedAt, w.PartsUsed))
            .ToListAsync(ct);

        return Ok(workOrders);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.ProjectsManage)]
    public async Task<ActionResult<WorkOrderDto>> Create(CreateWorkOrderDto dto, CancellationToken ct)
    {
        var workOrder = new WorkOrder
        {
            WorkOrderNo = await _numbers.NextAsync(NumberType.WorkOrder, ct),
            ProjectId = dto.ProjectId,
            MachineId = dto.MachineId,
            CustomerId = dto.CustomerId,
            Title = dto.Title,
            ProblemDescription = dto.ProblemDescription,
            Priority = dto.Priority,
            Status = dto.Status,
            ScheduledDate = dto.ScheduledDate,
            PartsUsed = dto.PartsUsed
        };

        await _workOrders.AddAsync(workOrder, ct);
        await _workOrders.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), new WorkOrderDto(
            workOrder.Id, workOrder.WorkOrderNo, workOrder.ProjectId, workOrder.MachineId, null,
            workOrder.CustomerId, null, workOrder.Title, workOrder.ProblemDescription, workOrder.Priority,
            workOrder.Status, workOrder.ScheduledDate, workOrder.CompletedAt, workOrder.PartsUsed));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.ProjectsManage)]
    public async Task<IActionResult> Update(Guid id, CreateWorkOrderDto dto, CancellationToken ct)
    {
        var workOrder = await _workOrders.GetByIdAsync(id, ct);
        if (workOrder is null)
        {
            return NotFound();
        }

        workOrder.ProjectId = dto.ProjectId;
        workOrder.MachineId = dto.MachineId;
        workOrder.CustomerId = dto.CustomerId;
        workOrder.Title = dto.Title;
        workOrder.ProblemDescription = dto.ProblemDescription;
        workOrder.Priority = dto.Priority;
        workOrder.Status = dto.Status;
        workOrder.ScheduledDate = dto.ScheduledDate;
        workOrder.PartsUsed = dto.PartsUsed;
        workOrder.CompletedAt = dto.Status == Domain.Common.WorkOrderStatus.Completed ? DateTime.UtcNow : null;
        workOrder.UpdatedAt = DateTime.UtcNow;

        await _workOrders.SaveChangesAsync(ct);
        return NoContent();
    }
}

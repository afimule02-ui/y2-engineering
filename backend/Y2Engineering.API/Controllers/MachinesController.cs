using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Machines;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/machines")]
[Authorize(Policy = Permissions.MachinesView)]
public class MachinesController : ControllerBase
{
    private readonly IRepository<Machine> _machines;
    private readonly IRepository<MaintenanceRecord> _maintenance;
    private readonly INumberGenerator _numbers;
    private readonly IQrCodeService _qr;

    public MachinesController(
        IRepository<Machine> machines,
        IRepository<MaintenanceRecord> maintenance,
        INumberGenerator numbers,
        IQrCodeService qr)
    {
        _machines = machines;
        _maintenance = maintenance;
        _numbers = numbers;
        _qr = qr;
    }

    [HttpGet]
    public async Task<ActionResult<List<MachineDto>>> List(CancellationToken ct)
    {
        var machines = await _machines.Query()
            .Include(m => m.Customer)
            .Include(m => m.Manufacturer)
            .Include(m => m.Model)
            .OrderBy(m => m.MachineNo)
            .Select(m => new MachineDto(
                m.Id, m.MachineNo, m.CustomerId, m.Customer != null ? m.Customer.ContactPerson : null,
                m.ManufacturerId, m.Manufacturer != null ? m.Manufacturer.Name : null,
                m.ModelId, m.Model != null ? m.Model.Name : null,
                m.SerialNumber, m.InstallationDate, m.Status, m.Location, m.QrCode, m.Notes))
            .ToListAsync(ct);

        return Ok(machines);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MachineDto>> Get(Guid id, CancellationToken ct)
    {
        var machine = await _machines.Query()
            .Include(m => m.Customer)
            .Include(m => m.Manufacturer)
            .Include(m => m.Model)
            .Where(m => m.Id == id)
            .Select(m => new MachineDto(
                m.Id, m.MachineNo, m.CustomerId, m.Customer != null ? m.Customer.ContactPerson : null,
                m.ManufacturerId, m.Manufacturer != null ? m.Manufacturer.Name : null,
                m.ModelId, m.Model != null ? m.Model.Name : null,
                m.SerialNumber, m.InstallationDate, m.Status, m.Location, m.QrCode, m.Notes))
            .FirstOrDefaultAsync(ct);

        return machine is null ? NotFound() : Ok(machine);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.MachinesManage)]
    public async Task<ActionResult<MachineDto>> Create(CreateMachineDto dto, CancellationToken ct)
    {
        var machine = new Machine
        {
            MachineNo = await _numbers.NextAsync(NumberType.Machine, ct),
            CustomerId = dto.CustomerId,
            ManufacturerId = dto.ManufacturerId,
            ModelId = dto.ModelId,
            SerialNumber = dto.SerialNumber,
            InstallationDate = dto.InstallationDate,
            Status = dto.Status,
            Location = dto.Location,
            Notes = dto.Notes
        };

        await _machines.AddAsync(machine, ct);
        await _machines.SaveChangesAsync(ct);

        machine.QrCode = _qr.GeneratePngDataUri($"{Request.Scheme}://{Request.Host}/api/machines/{machine.Id}");
        await _machines.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = machine.Id }, ToDto(machine));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.MachinesManage)]
    public async Task<IActionResult> Update(Guid id, CreateMachineDto dto, CancellationToken ct)
    {
        var machine = await _machines.GetByIdAsync(id, ct);
        if (machine is null)
        {
            return NotFound();
        }

        machine.CustomerId = dto.CustomerId;
        machine.ManufacturerId = dto.ManufacturerId;
        machine.ModelId = dto.ModelId;
        machine.SerialNumber = dto.SerialNumber;
        machine.InstallationDate = dto.InstallationDate;
        machine.Status = dto.Status;
        machine.Location = dto.Location;
        machine.Notes = dto.Notes;
        machine.UpdatedAt = DateTime.UtcNow;

        await _machines.SaveChangesAsync(ct);
        return Ok(ToDto(machine));
    }

    [HttpGet("{id:guid}/maintenance")]
    public async Task<ActionResult<List<MaintenanceRecordDto>>> Maintenance(Guid id, CancellationToken ct)
    {
        var records = await _maintenance.Query()
            .Where(r => r.MachineId == id)
            .OrderByDescending(r => r.Date)
            .Select(r => new MaintenanceRecordDto(
                r.Id, r.MachineId, r.Type, r.Title, r.Description, r.Date, r.Cost, r.NextDueDate))
            .ToListAsync(ct);

        return Ok(records);
    }

    [HttpPost("{id:guid}/maintenance")]
    [Authorize(Policy = Permissions.MachinesManage)]
    public async Task<ActionResult<MaintenanceRecordDto>> AddMaintenance(Guid id, CreateMaintenanceRecordDto dto, CancellationToken ct)
    {
        if (await _machines.GetByIdAsync(id, ct) is null)
        {
            return NotFound();
        }

        var record = new MaintenanceRecord
        {
            MachineId = id,
            Type = dto.Type,
            Title = dto.Title,
            Description = dto.Description,
            Date = dto.Date,
            Cost = dto.Cost,
            WorkOrderId = dto.WorkOrderId,
            NextDueDate = dto.NextDueDate
        };

        await _maintenance.AddAsync(record, ct);
        await _maintenance.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Maintenance), new { id }, new MaintenanceRecordDto(
            record.Id, record.MachineId, record.Type, record.Title, record.Description,
            record.Date, record.Cost, record.NextDueDate));
    }

    [HttpGet("{id:guid}/qr")]
    [AllowAnonymous]
    public async Task<IActionResult> Qr(Guid id, CancellationToken ct)
    {
        var machine = await _machines.GetByIdAsync(id, ct);
        if (machine is null)
        {
            return NotFound();
        }

        var payload = $"{Request.Scheme}://{Request.Host}/api/machines/{machine.Id}";
        var bytes = _qr.GeneratePng(payload);
        return File(bytes, "image/png");
    }

    private static MachineDto ToDto(Machine m) => new(
        m.Id, m.MachineNo, m.CustomerId, null, m.ManufacturerId, null, m.ModelId, null,
        m.SerialNumber, m.InstallationDate, m.Status, m.Location, m.QrCode, m.Notes);
}

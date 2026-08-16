using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

public record MachineDto(
    Guid Id,
    string MachineNo,
    Guid? CustomerId,
    string? CustomerName,
    Guid? ManufacturerId,
    string? ManufacturerName,
    Guid? ModelId,
    string? ModelName,
    string? SerialNumber,
    DateTime? InstallationDate,
    MachineStatus Status,
    string? Location,
    string? QrCode,
    string? Notes);

public record CreateMachineDto(
    Guid? CustomerId,
    Guid? ManufacturerId,
    Guid? ModelId,
    string? SerialNumber,
    DateTime? InstallationDate,
    MachineStatus Status,
    string? Location,
    string? Notes);

public record MaintenanceRecordDto(
    Guid Id,
    Guid MachineId,
    MaintenanceType Type,
    string Title,
    string? Description,
    DateTime Date,
    decimal Cost,
    DateTime? NextDueDate);

public record CreateMaintenanceRecordDto(
    MaintenanceType Type,
    string Title,
    string? Description,
    DateTime Date,
    decimal Cost,
    Guid? WorkOrderId,
    DateTime? NextDueDate);

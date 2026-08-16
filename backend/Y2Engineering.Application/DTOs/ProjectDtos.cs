using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string ProjectNo,
    string Name,
    Guid? CustomerId,
    string? CustomerName,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    ProjectStatus Status,
    int Progress,
    decimal Budget);

public record CreateProjectDto(
    string Name,
    Guid? CustomerId,
    Guid? QuotationId,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    ProjectStatus Status,
    int Progress,
    decimal Budget);

public record ProjectTaskDto(Guid Id, Guid ProjectId, string Title, string? Description,
    ProjectTaskStatus Status, DateTime? DueDate, DateTime? CompletedAt, int SortOrder);

public record WorkOrderDto(
    Guid Id,
    string WorkOrderNo,
    Guid? ProjectId,
    Guid? MachineId,
    string? MachineName,
    Guid? CustomerId,
    string? CustomerName,
    string Title,
    string ProblemDescription,
    Priority Priority,
    WorkOrderStatus Status,
    DateTime? ScheduledDate,
    DateTime? CompletedAt,
    string? PartsUsed);

public record CreateWorkOrderDto(
    Guid? ProjectId,
    Guid? MachineId,
    Guid? CustomerId,
    string Title,
    string ProblemDescription,
    Priority Priority,
    WorkOrderStatus Status,
    DateTime? ScheduledDate,
    string? PartsUsed);

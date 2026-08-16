using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.DTOs;

public record CreateServiceRequestDto(
    Guid? ServiceId,
    Guid? CustomerId,
    string? MachineName,
    string? MachineManufacturer,
    string? MachineModel,
    string? SerialNumber,
    string ProblemDescription,
    Priority Priority,
    DateTime? PreferredDate,
    string? Location,
    string? City,
    string? ContactPerson,
    string? ContactEmail,
    string? ContactPhone);

public record UpdateServiceRequestStatusDto(ServiceRequestStatus Status, string? Notes);

public record ServiceRequestListItemDto(
    Guid Id,
    string RequestNo,
    string? ServiceName,
    string? MachineName,
    string ProblemDescription,
    Priority Priority,
    ServiceRequestStatus Status,
    string? ContactPerson,
    string? ContactEmail,
    string? ContactPhone,
    string? City,
    DateTime CreatedAt,
    Guid? CustomerId);

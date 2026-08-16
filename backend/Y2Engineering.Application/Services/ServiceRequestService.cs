using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Common;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Services;
using Service = Y2Engineering.Domain.Services.Service;

namespace Y2Engineering.Application.Services;

public interface IServiceRequestService
{
    Task<ServiceRequestListItemDto> CreateAsync(CreateServiceRequestDto dto, Guid? userId, CancellationToken ct = default);

    Task<List<ServiceRequestListItemDto>> ListAllAsync(CancellationToken ct = default);

    Task<List<ServiceRequestListItemDto>> ListForCustomerAsync(Guid customerId, CancellationToken ct = default);

    Task<ServiceRequestListItemDto?> GetAsync(Guid id, CancellationToken ct = default);

    Task UpdateStatusAsync(Guid id, ServiceRequestStatus status, string? notes, CancellationToken ct = default);
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly IRepository<ServiceRequest> _requests;
    private readonly IRepository<Customer> _customers;
    private readonly INumberGenerator _numbers;
    private readonly INotificationService _notifications;

    public ServiceRequestService(
        IRepository<ServiceRequest> requests,
        IRepository<Customer> customers,
        INumberGenerator numbers,
        INotificationService notifications)
    {
        _requests = requests;
        _customers = customers;
        _numbers = numbers;
        _notifications = notifications;
    }

    public async Task<ServiceRequestListItemDto> CreateAsync(CreateServiceRequestDto dto, Guid? userId, CancellationToken ct = default)
    {
        Customer? customer = null;

        // If the caller is a registered customer, attach their customer record.
        if (userId.HasValue)
        {
            customer = await _customers.Query()
                .FirstOrDefaultAsync(c => c.UserAccountId == userId.Value, ct);
        }
        else if (dto.CustomerId.HasValue)
        {
            customer = await _customers.GetByIdAsync(dto.CustomerId.Value, ct);
        }

        var request = new ServiceRequest
        {
            RequestNo = await _numbers.NextAsync(NumberType.ServiceRequest, ct),
            CustomerId = customer?.Id,
            ServiceId = dto.ServiceId,
            MachineName = dto.MachineName,
            MachineManufacturer = dto.MachineManufacturer,
            MachineModel = dto.MachineModel,
            SerialNumber = dto.SerialNumber,
            ProblemDescription = dto.ProblemDescription,
            Priority = dto.Priority,
            PreferredDate = dto.PreferredDate,
            Location = dto.Location,
            City = dto.City,
            ContactPerson = dto.ContactPerson ?? customer?.ContactPerson,
            ContactEmail = dto.ContactEmail ?? customer?.Email,
            ContactPhone = dto.ContactPhone ?? customer?.Phone,
            Status = ServiceRequestStatus.Pending,
            CreatedBy = userId
        };

        await _requests.AddAsync(request, ct);
        await _requests.SaveChangesAsync(ct);

        await _notifications.NotifyAsync(
            null,
            "New service request",
            $"Service request {request.RequestNo} was submitted.",
            nameof(ServiceRequest),
            request.Id.ToString(),
            ct);

        return ToListItem(request);
    }

    public async Task<List<ServiceRequestListItemDto>> ListAllAsync(CancellationToken ct = default)
    {
        var items = await _requests.Query()
            .Include(r => r.Service)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return items.Select(ToListItem).ToList();
    }

    public async Task<List<ServiceRequestListItemDto>> ListForCustomerAsync(Guid customerId, CancellationToken ct = default)
    {
        var items = await _requests.Query()
            .Where(r => r.CustomerId == customerId)
            .Include(r => r.Service)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return items.Select(ToListItem).ToList();
    }

    public async Task<ServiceRequestListItemDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var request = await _requests.Query()
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

        return request is null ? null : ToListItem(request);
    }

    public async Task UpdateStatusAsync(Guid id, ServiceRequestStatus status, string? notes, CancellationToken ct = default)
    {
        var request = await _requests.GetByIdAsync(id, ct)
            ?? throw new DomainException($"Service request {id} was not found.");

        request.Status = status;
        request.Notes = notes ?? request.Notes;
        request.UpdatedAt = DateTime.UtcNow;
        await _requests.SaveChangesAsync(ct);

        await _notifications.NotifyAsync(
            request.CustomerId,
            "Service request updated",
            $"Service request {request.RequestNo} is now {status}.",
            nameof(ServiceRequest),
            request.Id.ToString(),
            ct);
    }

    private static ServiceRequestListItemDto ToListItem(ServiceRequest r) => new(
        r.Id,
        r.RequestNo,
        r.Service?.Name,
        r.MachineName,
        r.ProblemDescription,
        r.Priority,
        r.Status,
        r.ContactPerson,
        r.ContactEmail,
        r.ContactPhone,
        r.City,
        r.CreatedAt,
        r.CustomerId);
}

using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Common;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Sales;
using Y2Engineering.Domain.Services;

namespace Y2Engineering.Application.Services;

public interface IQuotationService
{
    Task<QuotationDto> CreateAsync(CreateQuotationDto dto, CancellationToken ct = default);

    Task<QuotationDto?> GetAsync(Guid id, CancellationToken ct = default);

    Task<List<QuotationListItemDto>> ListAllAsync(CancellationToken ct = default);

    Task<List<QuotationListItemDto>> ListForCustomerAsync(Guid customerId, CancellationToken ct = default);

    Task AcceptAsync(Guid id, CancellationToken ct = default);

    Task RejectAsync(Guid id, CancellationToken ct = default);
}

public class QuotationService : IQuotationService
{
    private readonly IRepository<Quotation> _quotations;
    private readonly IRepository<QuotationItem> _items;
    private readonly IRepository<ServiceRequest> _serviceRequests;
    private readonly INumberGenerator _numbers;
    private readonly INotificationService _notifications;

    public QuotationService(
        IRepository<Quotation> quotations,
        IRepository<QuotationItem> items,
        IRepository<ServiceRequest> serviceRequests,
        INumberGenerator numbers,
        INotificationService notifications)
    {
        _quotations = quotations;
        _items = items;
        _numbers = numbers;
        _notifications = notifications;
        _serviceRequests = serviceRequests;
    }

    public async Task<QuotationDto> CreateAsync(CreateQuotationDto dto, CancellationToken ct = default)
    {
        var quotation = new Quotation
        {
            QuotationNo = await _numbers.NextAsync(NumberType.Quotation, ct),
            CustomerId = dto.CustomerId,
            ServiceRequestId = dto.ServiceRequestId,
            Title = dto.Title,
            IssueDate = DateTime.UtcNow,
            ExpiryDate = dto.ExpiryDate ?? DateTime.UtcNow.AddDays(30),
            Discount = dto.Discount,
            TaxRate = dto.TaxRate,
            Notes = dto.Notes,
            Status = QuotationStatus.Sent
        };

        foreach (var item in dto.Items)
        {
            quotation.Items.Add(new QuotationItem
            {
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        await _quotations.AddAsync(quotation, ct);
        await _quotations.SaveChangesAsync(ct);

        // Mark the originating service request as quoted.
        if (dto.ServiceRequestId.HasValue)
        {
            var request = await _serviceRequests.GetByIdAsync(dto.ServiceRequestId.Value, ct);
            if (request is not null)
            {
                request.Status = ServiceRequestStatus.Quoted;
                request.UpdatedAt = DateTime.UtcNow;
                await _serviceRequests.SaveChangesAsync(ct);
            }
        }

        await _notifications.NotifyAsync(
            null,
            "Quotation created",
            $"Quotation {quotation.QuotationNo} for \"{quotation.Title}\" was created.",
            nameof(Quotation),
            quotation.Id.ToString(),
            ct);

        return await GetAsync(quotation.Id, ct) ?? throw new DomainException("Quotation could not be loaded after creation.");
    }

    public async Task<QuotationDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var quotation = await _quotations.Query()
            .Include(q => q.Items)
            .Include(q => q.Customer)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

        if (quotation is null)
        {
            return null;
        }

        return new QuotationDto(
            quotation.Id,
            quotation.QuotationNo,
            quotation.CustomerId,
            quotation.ServiceRequestId,
            quotation.Title,
            quotation.IssueDate,
            quotation.ExpiryDate,
            quotation.Status,
            quotation.Subtotal,
            quotation.Discount,
            quotation.TaxRate,
            quotation.TaxAmount,
            quotation.Total,
            quotation.Currency,
            quotation.Notes,
            quotation.Items.OrderBy(i => i.CreatedAt)
                .Select(i => new QuotationItemDto(i.Id, i.Description, i.Quantity, i.UnitPrice, i.Total))
                .ToList());
    }

    public async Task<List<QuotationListItemDto>> ListAllAsync(CancellationToken ct = default)
    {
        var quotations = await _quotations.Query()
            .Include(q => q.Customer)
            .OrderByDescending(q => q.IssueDate)
            .ToListAsync(ct);

        return quotations.Select(ToListItem).ToList();
    }

    public async Task<List<QuotationListItemDto>> ListForCustomerAsync(Guid customerId, CancellationToken ct = default)
    {
        var quotations = await _quotations.Query()
            .Where(q => q.CustomerId == customerId)
            .Include(q => q.Customer)
            .OrderByDescending(q => q.IssueDate)
            .ToListAsync(ct);

        return quotations.Select(ToListItem).ToList();
    }

    public async Task AcceptAsync(Guid id, CancellationToken ct = default)
    {
        var quotation = await _quotations.GetByIdAsync(id, ct)
            ?? throw new DomainException("Quotation not found.");

        if (quotation.Status is QuotationStatus.Rejected or QuotationStatus.Converted)
        {
            throw new DomainException($"A {quotation.Status.ToString().ToLowerInvariant()} quotation cannot be accepted.");
        }

        quotation.Status = QuotationStatus.Accepted;
        quotation.UpdatedAt = DateTime.UtcNow;
        await _quotations.SaveChangesAsync(ct);

        await _notifications.NotifyAsync(
            null,
            "Quotation accepted",
            $"Quotation {quotation.QuotationNo} was accepted by the customer.",
            nameof(Quotation),
            quotation.Id.ToString(),
            ct);
    }

    public async Task RejectAsync(Guid id, CancellationToken ct = default)
    {
        var quotation = await _quotations.GetByIdAsync(id, ct)
            ?? throw new DomainException("Quotation not found.");

        quotation.Status = QuotationStatus.Rejected;
        quotation.UpdatedAt = DateTime.UtcNow;
        await _quotations.SaveChangesAsync(ct);
    }

    private static QuotationListItemDto ToListItem(Quotation q) => new(
        q.Id,
        q.QuotationNo,
        q.Title,
        q.Customer?.ContactPerson,
        q.Status,
        q.Total,
        q.IssueDate,
        q.ExpiryDate);
}

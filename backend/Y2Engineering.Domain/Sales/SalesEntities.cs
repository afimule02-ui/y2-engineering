using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Services;

namespace Y2Engineering.Domain.Sales;

public class Quotation : EntityBase
{
    public string QuotationNo { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? ServiceRequestId { get; set; }

    public ServiceRequest? ServiceRequest { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;

    public DateTime ExpiryDate { get; set; }

    public QuotationStatus Status { get; set; } = QuotationStatus.Draft;

    public decimal Subtotal { get; set; }

    public decimal Discount { get; set; }

    public decimal TaxRate { get; set; } = 15m;

    public decimal TaxAmount => Math.Round((Subtotal - Discount) * TaxRate / 100m, 2);

    public decimal Total => Math.Round(Subtotal - Discount + TaxAmount, 2);

    public string Currency { get; set; } = "ETB";

    public string? Notes { get; set; }

    public ICollection<QuotationItem> Items { get; set; } = new List<QuotationItem>();
}

public class QuotationItem : EntityBase
{
    public Guid QuotationId { get; set; }

    public Quotation Quotation { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; }

    public decimal Total => Quantity * UnitPrice;
}

public class Contract : EntityBase
{
    public string ContractNo { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? ProjectId { get; set; }

    public string? Title { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public decimal Amount { get; set; }

    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    public string? Terms { get; set; }

    public DateTime? SignedDate { get; set; }
}

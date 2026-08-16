using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;

namespace Y2Engineering.Domain.Finance;

public class Invoice : EntityBase
{
    public string InvoiceNo { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? ProjectId { get; set; }

    public Guid? ContractId { get; set; }

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;

    public DateTime DueDate { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    public decimal Subtotal { get; set; }

    public decimal TaxRate { get; set; } = 15m;

    public decimal TaxAmount => Math.Round(Subtotal * TaxRate / 100m, 2);

    public decimal Total => Math.Round(Subtotal + TaxAmount, 2);

    public decimal PaidAmount { get; set; }

    public decimal Balance => Total - PaidAmount;

    public string? Notes { get; set; }

    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class InvoiceItem : EntityBase
{
    public Guid InvoiceId { get; set; }

    public Invoice Invoice { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; }

    public decimal Total => Quantity * UnitPrice;
}

public class Payment : EntityBase
{
    public string PaymentNo { get; set; } = string.Empty;

    public Guid? InvoiceId { get; set; }

    public Invoice? Invoice { get; set; }

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; } = PaymentMethod.BankTransfer;

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public string? Reference { get; set; }

    public string? Notes { get; set; }
}

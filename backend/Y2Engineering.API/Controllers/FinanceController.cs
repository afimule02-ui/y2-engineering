using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Finance;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/finance")]
[Authorize(Policy = Permissions.InvoicesView)]
public class FinanceController : ControllerBase
{
    private readonly IRepository<Invoice> _invoices;
    private readonly IRepository<Payment> _payments;
    private readonly INumberGenerator _numbers;

    public FinanceController(
        IRepository<Invoice> invoices,
        IRepository<Payment> payments,
        INumberGenerator numbers)
    {
        _invoices = invoices;
        _payments = payments;
        _numbers = numbers;
    }

    [HttpGet("payments")]
    public async Task<ActionResult<List<PaymentDto>>> Payments(CancellationToken ct)
    {
        var payments = await _payments.Query()
            .Include(p => p.Invoice)
            .Include(p => p.Customer)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentDto(
                p.Id, p.PaymentNo, p.InvoiceId, p.Invoice != null ? p.Invoice.InvoiceNo : null,
                p.Customer != null ? p.Customer.ContactPerson : null, p.Amount, p.Method, p.Status,
                p.PaymentDate, p.Reference))
            .ToListAsync(ct);

        return Ok(payments);
    }

    [HttpGet("invoices")]
    public async Task<ActionResult<List<InvoiceDto>>> Invoices(CancellationToken ct)
    {
        var invoices = await _invoices.Query()
            .Include(i => i.Customer)
            .OrderByDescending(i => i.IssueDate)
            .Select(i => new InvoiceDto(
                i.Id, i.InvoiceNo, i.CustomerId, i.Customer != null ? i.Customer.ContactPerson : null,
                i.IssueDate, i.DueDate, i.Status, i.Subtotal, i.TaxAmount, i.Total, i.PaidAmount, i.Balance))
            .ToListAsync(ct);

        return Ok(invoices);
    }

    [HttpPost("invoices")]
    [Authorize(Policy = Permissions.InvoicesManage)]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice(CreateInvoiceDto dto, CancellationToken ct)
    {
        var invoice = new Invoice
        {
            InvoiceNo = await _numbers.NextAsync(NumberType.Invoice, ct),
            CustomerId = dto.CustomerId,
            ProjectId = dto.ProjectId,
            ContractId = dto.ContractId,
            IssueDate = dto.IssueDate,
            DueDate = dto.DueDate,
            Status = InvoiceStatus.Sent,
            Subtotal = dto.Subtotal,
            TaxRate = dto.TaxRate,
            Notes = dto.Notes
        };

        await _invoices.AddAsync(invoice, ct);
        await _invoices.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Invoices), new InvoiceDto(
            invoice.Id, invoice.InvoiceNo, invoice.CustomerId, null, invoice.IssueDate, invoice.DueDate,
            invoice.Status, invoice.Subtotal, invoice.TaxAmount, invoice.Total, invoice.PaidAmount, invoice.Balance));
    }

    [HttpPost("payments")]
    [Authorize(Policy = Permissions.InvoicesManage)]
    public async Task<IActionResult> CreatePayment(CreatePaymentDto dto, CancellationToken ct)
    {
        var invoice = await _invoices.GetByIdAsync(dto.InvoiceId, ct);
        if (invoice is null)
        {
            return NotFound();
        }

        if (dto.Amount <= 0 || dto.Amount > invoice.Balance)
        {
            return BadRequest(new { error = $"Payment amount must be between 0 and the outstanding balance ({invoice.Balance})." });
        }

        var payment = new Payment
        {
            PaymentNo = await _numbers.NextAsync(NumberType.Payment, ct),
            InvoiceId = invoice.Id,
            CustomerId = invoice.CustomerId,
            Amount = dto.Amount,
            Method = dto.Method,
            Reference = dto.Reference,
            Status = PaymentStatus.Completed,
            PaymentDate = DateTime.UtcNow
        };

        await _payments.AddAsync(payment, ct);
        await _payments.SaveChangesAsync(ct);

        invoice.PaidAmount += dto.Amount;
        invoice.Status = invoice.Balance <= 0 ? InvoiceStatus.Paid : InvoiceStatus.PartialPaid;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoices.SaveChangesAsync(ct);

        return Ok(new { paymentNo = payment.PaymentNo, invoiceNo = invoice.InvoiceNo, balance = invoice.Balance });
    }
}

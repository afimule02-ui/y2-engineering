using FluentValidation.TestHelper;
using Xunit;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Validators;
using Y2Engineering.Domain.Sales;

namespace Y2Engineering.Tests;

public class QuotationTests
{
    [Fact]
    public void Quotation_ComputesTaxAndTotal()
    {
        var quotation = new Quotation
        {
            QuotationNo = "QT-2026-00001",
            Title = "Installation",
            Subtotal = 100000m,
            Discount = 10000m,
            TaxRate = 15m
        };

        Assert.Equal(13500m, quotation.TaxAmount);
        Assert.Equal(103500m, quotation.Total);
    }

    [Fact]
    public async Task Validator_RejectsQuotationWithoutItems()
    {
        var validator = new CreateQuotationDtoValidator();
        var dto = new CreateQuotationDto(null, null, "Installation", null, 0, 15, null,
            new List<CreateQuotationItemDto>());

        var result = await validator.TestValidateAsync(dto);
        result.ShouldHaveValidationErrorFor(x => x.Items);
    }

    [Fact]
    public async Task Validator_RejectsZeroQuantityItem()
    {
        var validator = new CreateQuotationDtoValidator();
        var dto = new CreateQuotationDto(null, null, "Installation", null, 0, 15, null,
            new List<CreateQuotationItemDto> { new("Labor", 0, 50000m) });

        var result = await validator.TestValidateAsync(dto);
        result.ShouldHaveValidationErrorFor("Items[0].Quantity");
    }
}

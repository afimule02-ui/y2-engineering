using FluentValidation.TestHelper;
using Xunit;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Validators;
using Y2Engineering.Domain.Common;

namespace Y2Engineering.Tests;

public class ServiceRequestTests
{
    [Fact]
    public async Task Validator_RejectsEmptyProblemDescription()
    {
        var validator = new CreateServiceRequestDtoValidator();
        var dto = new CreateServiceRequestDto(
            null, null, "Filling Machine", null, null, null, string.Empty,
            Priority.High, null, "Addis Ababa", "Addis Ababa", "John", "john@test.com", "0911000000");

        var result = await validator.TestValidateAsync(dto);
        result.ShouldHaveValidationErrorFor(x => x.ProblemDescription);
    }

    [Fact]
    public async Task Validator_AcceptsValidRequest()
    {
        var validator = new CreateServiceRequestDtoValidator();
        var dto = new CreateServiceRequestDto(
            null, null, "Filling Machine", null, null, null, "Machine stops after 20 minutes.",
            Priority.High, DateTime.Today.AddDays(3), "Addis Ababa", "Addis Ababa", "John", "john@test.com", "0911000000");

        var result = await validator.TestValidateAsync(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }
}

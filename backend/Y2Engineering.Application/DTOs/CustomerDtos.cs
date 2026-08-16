namespace Y2Engineering.Application.DTOs;

public record CustomerDto(
    Guid Id,
    string CustomerCode,
    Guid? CompanyId,
    string? CompanyName,
    string ContactPerson,
    string? Email,
    string? Phone,
    string? City,
    string? Address,
    bool IsActive,
    string? Notes);

public record CreateCustomerDto(
    string? CompanyId,
    string ContactPerson,
    string? Email,
    string? Phone,
    string? City,
    string? Address,
    string? Notes);

public record CompanyDto(Guid Id, string Name, string? RegistrationNo, string? Industry,
    string? City, string? Country, string? Phone, string? Email, string? Website);

public record CreateCompanyDto(string Name, string? RegistrationNo, string? Industry,
    string? City, string? Country, string? Phone, string? Email, string? Website);

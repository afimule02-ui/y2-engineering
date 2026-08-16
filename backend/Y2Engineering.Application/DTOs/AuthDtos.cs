namespace Y2Engineering.Application.DTOs;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? CompanyName,
    string? Phone);

public record LoginRequest(string Email, string Password);

public record TokenResponse(
    string Token,
    DateTime ExpiresAt,
    UserProfileDto User);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions,
    string? Language,
    Guid? CompanyId);

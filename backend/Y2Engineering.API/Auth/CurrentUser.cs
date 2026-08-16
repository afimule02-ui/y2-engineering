using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Infrastructure.Jwt;

namespace Y2Engineering.API.Auth;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
        => Guid.TryParse(Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub), out var id) ? id : null;

    public string? UserName => Principal?.FindFirstValue(JwtRegisteredClaimNames.Email);

    public string? FullName => Principal?.FindFirstValue("fullname");

    public IReadOnlyList<string> Roles
        => (Principal?.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToList() ?? new List<string>());

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    public bool HasPermission(string permission)
        => Principal?.FindAll(JwtTokenService.PermissionClaimType).Any(c => c.Value == permission) ?? false;
}

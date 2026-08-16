using Y2Engineering.Domain.Identity;

namespace Y2Engineering.Application.Interfaces;

public interface ITokenService
{
    string CreateToken(ApplicationUser user, IReadOnlyList<string> roles, IReadOnlyList<string> permissions);
}

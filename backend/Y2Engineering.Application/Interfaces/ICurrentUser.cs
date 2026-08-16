namespace Y2Engineering.Application.Interfaces;

public interface ICurrentUser
{
    Guid? UserId { get; }

    string? UserName { get; }

    string? FullName { get; }

    IReadOnlyList<string> Roles { get; }

    bool IsAuthenticated { get; }

    bool HasPermission(string permission);
}

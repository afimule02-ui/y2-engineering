using Microsoft.EntityFrameworkCore;
using Y2Engineering.Persistence;

namespace Y2Engineering.API.Auth;

public class PermissionResolver
{
    private readonly ApplicationDbContext _db;

    public PermissionResolver(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<string>> GetPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var roleIds = await _db.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        return await _db.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}

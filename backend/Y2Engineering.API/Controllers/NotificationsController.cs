using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Communication;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IRepository<Notification> _notifications;
    private readonly ICurrentUser _currentUser;

    public NotificationsController(IRepository<Notification> notifications, ICurrentUser currentUser)
    {
        _notifications = notifications;
        _currentUser = currentUser;
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<Notification>>> Mine(CancellationToken ct)
    {
        var notifications = await _notifications.Query()
            .Where(n => n.UserId == _currentUser.UserId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        return Ok(notifications);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var notification = await _notifications.GetByIdAsync(id, ct);
        if (notification is null || notification.UserId != _currentUser.UserId)
        {
            return NotFound();
        }

        notification.IsRead = true;
        await _notifications.SaveChangesAsync(ct);

        return NoContent();
    }
}

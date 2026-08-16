using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Communication;

namespace Y2Engineering.Infrastructure.Notifications;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notifications;

    public NotificationService(IRepository<Notification> notifications)
    {
        _notifications = notifications;
    }

    public async Task NotifyAsync(
        Guid? userId,
        string title,
        string? body,
        string? referenceType = null,
        string? referenceId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Body = body,
            Channel = NotificationChannel.InApp,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            IsRead = false
        };

        await _notifications.AddAsync(notification, cancellationToken);
        await _notifications.SaveChangesAsync(cancellationToken);
    }
}

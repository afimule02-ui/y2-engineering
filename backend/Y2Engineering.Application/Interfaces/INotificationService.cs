using Y2Engineering.Domain.Common;

namespace Y2Engineering.Application.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Persists an in-app notification for a user and, when requested,
    /// delivers it through additional channels (email/SMS).
    /// </summary>
    Task NotifyAsync(
        Guid? userId,
        string title,
        string? body,
        string? referenceType = null,
        string? referenceId = null,
        CancellationToken cancellationToken = default);
}

using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Communication;

public class Conversation : EntityBase
{
    public string? Title { get; set; }

    public Guid? CustomerId { get; set; }

    public Guid? UserId { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

public class Message : EntityBase
{
    public Guid ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    public Guid? SenderId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; }
}

public class Notification : EntityBase
{
    public Guid? UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Body { get; set; }

    public NotificationChannel Channel { get; set; } = NotificationChannel.InApp;

    public string? ReferenceType { get; set; }

    public string? ReferenceId { get; set; }

    public bool IsRead { get; set; }
}

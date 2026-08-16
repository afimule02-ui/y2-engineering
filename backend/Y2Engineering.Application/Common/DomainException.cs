namespace Y2Engineering.Application.Common;

/// <summary>
/// Business rule violation thrown by application services.
/// The API layer maps this to a 400 Bad Request response.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message)
        : base(message)
    {
    }
}

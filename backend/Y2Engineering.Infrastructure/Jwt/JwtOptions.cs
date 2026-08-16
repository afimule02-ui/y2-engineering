namespace Y2Engineering.Infrastructure.Jwt;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = "Y2Engineering";

    public string Audience { get; set; } = "Y2EngineeringClients";

    public int ExpiryMinutes { get; set; } = 480;
}

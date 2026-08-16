using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Y2Engineering.Application.Interfaces;

namespace Y2Engineering.Infrastructure.Email;

/// <summary>
/// SMTP sender. When Email:Host is not configured the service logs the
/// message instead of sending, so the platform runs without a mail server.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogInformation("[Email not configured] To: {To} | Subject: {Subject}", to, subject);
            return;
        }

        var from = _configuration["Email:From"] ?? "noreply@y2engineering.com";
        var port = int.TryParse(_configuration["Email:Port"], out var p) ? p : 587;
        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];

        using var message = new MailMessage(from, to)
        {
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true
        };

        if (!string.IsNullOrEmpty(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }
}

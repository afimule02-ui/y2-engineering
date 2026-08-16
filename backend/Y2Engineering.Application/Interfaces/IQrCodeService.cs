namespace Y2Engineering.Application.Interfaces;

public interface IQrCodeService
{
    /// <summary>Generates a QR code PNG for the payload and returns it as a base64 data URI.</summary>
    string GeneratePngDataUri(string payload);

    /// <summary>Generates a QR code PNG for the payload and returns the raw bytes.</summary>
    byte[] GeneratePng(string payload);
}

using QRCoder;
using Y2Engineering.Application.Interfaces;

namespace Y2Engineering.Infrastructure.Qr;

public class QrCodeService : IQrCodeService
{
    public string GeneratePngDataUri(string payload)
    {
        var bytes = GeneratePng(payload);
        return $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
    }

    public byte[] GeneratePng(string payload)
    {
        using var generator = new QRCodeGenerator();
        var data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(data);
        return qrCode.GetGraphic(20);
    }
}

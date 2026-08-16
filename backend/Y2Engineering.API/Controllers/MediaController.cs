using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Cms;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IStorageService _storage;
    private readonly IRepository<MediaAsset> _media;

    public MediaController(IStorageService storage, IRepository<MediaAsset> media)
    {
        _storage = storage;
        _media = media;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<MediaAssetDto>> Upload(IFormFile file, string? folder = "uploads", CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { error = "No file was uploaded." });
        }

        await using var stream = file.OpenReadStream();
        var path = await _storage.SaveAsync(stream, file.FileName, folder ?? "uploads", ct);

        var asset = new MediaAsset
        {
            FileName = file.FileName,
            FileType = file.ContentType,
            Size = file.Length,
            StoragePath = path
        };

        await _media.AddAsync(asset, ct);
        await _media.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Upload), new MediaAssetDto(
            asset.Id, asset.FileName, asset.FileType, asset.Size, asset.StoragePath, null));
    }
}

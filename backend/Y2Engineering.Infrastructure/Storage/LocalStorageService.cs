using Microsoft.Extensions.Configuration;
using Y2Engineering.Application.Interfaces;

namespace Y2Engineering.Infrastructure.Storage;

/// <summary>
/// Stores files on local disk. Swap for Azure Blob / S3 / MinIO later by
/// implementing <see cref="IStorageService"/> in a new provider.
/// </summary>
public class LocalStorageService : IStorageService
{
    private readonly string _rootPath;

    public LocalStorageService(IConfiguration configuration)
    {
        _rootPath = Path.GetFullPath(configuration["Storage:LocalPath"] ?? "uploads");
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var safeFolder = Sanitize(folder);
        var safeName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var relativePath = Path.Combine(safeFolder, safeName);
        var absolutePath = Path.Combine(_rootPath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);
        await using var stream = File.Create(absolutePath);
        await content.CopyToAsync(stream, cancellationToken);

        return relativePath.Replace('\\', '/');
    }

    public Task<Stream?> OpenAsync(string path, CancellationToken cancellationToken = default)
    {
        var absolutePath = Path.Combine(_rootPath, Sanitize(path));
        if (!File.Exists(absolutePath))
        {
            return Task.FromResult<Stream?>(null);
        }

        return Task.FromResult<Stream?>(File.OpenRead(absolutePath));
    }

    public Task DeleteAsync(string path, CancellationToken cancellationToken = default)
    {
        var absolutePath = Path.Combine(_rootPath, Sanitize(path));
        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }

        return Task.CompletedTask;
    }

    private static string Sanitize(string path)
        => string.Join('/', path.Split('/', '\\').Where(s => !string.IsNullOrEmpty(s) && s != ".."));
}

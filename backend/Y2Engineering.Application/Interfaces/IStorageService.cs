namespace Y2Engineering.Application.Interfaces;

/// <summary>
/// Abstraction over object/file storage. Local disk is the default
/// implementation; Azure Blob / S3 / MinIO can be swapped in later.
/// </summary>
public interface IStorageService
{
    Task<string> SaveAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default);

    Task<Stream?> OpenAsync(string path, CancellationToken cancellationToken = default);

    Task DeleteAsync(string path, CancellationToken cancellationToken = default);
}

namespace Y2Engineering.Application.Interfaces;

/// <summary>
/// Generic repository. Keeps the application layer decoupled from EF Core.
/// Queries are expressed over <see cref="Query{T}"/> so callers can compose
/// with LINQ (paging, filtering, projections) before materializing.
/// </summary>
public interface IRepository<TEntity> where TEntity : class
{
    IQueryable<TEntity> Query();

    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<TEntity>> ListAsync(CancellationToken cancellationToken = default);

    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    void Update(TEntity entity);

    void Remove(TEntity entity);

    Task<int> CountAsync(CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

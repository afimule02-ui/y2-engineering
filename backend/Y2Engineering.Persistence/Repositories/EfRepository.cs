using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Interfaces;

namespace Y2Engineering.Persistence.Repositories;

public class EfRepository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly ApplicationDbContext DbContext;

    public EfRepository(ApplicationDbContext dbContext)
    {
        DbContext = dbContext;
    }

    public IQueryable<TEntity> Query() => DbContext.Set<TEntity>();

    public async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbContext.Set<TEntity>().FindAsync(new object[] { id }, cancellationToken);

    public async Task<List<TEntity>> ListAsync(CancellationToken cancellationToken = default)
        => await DbContext.Set<TEntity>().ToListAsync(cancellationToken);

    public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await DbContext.Set<TEntity>().AddAsync(entity, cancellationToken);
        return entity;
    }

    public void Update(TEntity entity) => DbContext.Set<TEntity>().Update(entity);

    public void Remove(TEntity entity) => DbContext.Set<TEntity>().Remove(entity);

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => DbContext.Set<TEntity>().CountAsync(cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => DbContext.SaveChangesAsync(cancellationToken);
}

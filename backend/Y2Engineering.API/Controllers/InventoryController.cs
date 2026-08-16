using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Common;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Identity;
using Y2Engineering.Domain.Inventory;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize(Policy = Permissions.InventoryView)]
public class InventoryController : ControllerBase
{
    private readonly IRepository<Product> _products;
    private readonly IRepository<Warehouse> _warehouses;
    private readonly IRepository<StockItem> _stock;
    private readonly IRepository<StockTransaction> _transactions;

    public InventoryController(
        IRepository<Product> products,
        IRepository<Warehouse> warehouses,
        IRepository<StockItem> stock,
        IRepository<StockTransaction> transactions)
    {
        _products = products;
        _warehouses = warehouses;
        _stock = stock;
        _transactions = transactions;
    }

    // ---------- Products ----------

    [HttpGet("products")]
    public async Task<ActionResult<List<ProductDto>>> Products(CancellationToken ct)
    {
        var products = await _products.Query()
            .OrderBy(p => p.Code)
            .Select(p => new ProductDto(
                p.Id, p.Code, p.Name, p.Description, p.Category, p.Unit, p.UnitPrice, p.IsActive))
            .ToListAsync(ct);

        return Ok(products);
    }

    [HttpPost("products")]
    [Authorize(Policy = Permissions.InventoryManage)]
    public async Task<ActionResult<ProductDto>> CreateProduct(ProductDto dto, CancellationToken ct)
    {
        var product = new Product
        {
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Unit = dto.Unit,
            UnitPrice = dto.UnitPrice,
            IsActive = dto.IsActive
        };

        await _products.AddAsync(product, ct);
        await _products.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Products), new ProductDto(
            product.Id, product.Code, product.Name, product.Description, product.Category,
            product.Unit, product.UnitPrice, product.IsActive));
    }

    // ---------- Warehouses ----------

    [HttpGet("warehouses")]
    public async Task<ActionResult<List<WarehouseDto>>> Warehouses(CancellationToken ct)
    {
        var warehouses = await _warehouses.Query()
            .OrderBy(w => w.Name)
            .Select(w => new WarehouseDto(w.Id, w.Code, w.Name, w.Location, w.IsActive))
            .ToListAsync(ct);

        return Ok(warehouses);
    }

    [HttpPost("warehouses")]
    [Authorize(Policy = Permissions.InventoryManage)]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse(CreateWarehouseDto dto, CancellationToken ct)
    {
        var warehouse = new Warehouse
        {
            Code = dto.Code,
            Name = dto.Name,
            Location = dto.Location,
            IsActive = true
        };

        await _warehouses.AddAsync(warehouse, ct);
        await _warehouses.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Warehouses), new WarehouseDto(
            warehouse.Id, warehouse.Code, warehouse.Name, warehouse.Location, warehouse.IsActive));
    }

    // ---------- Stock ----------

    [HttpGet("stock")]
    public async Task<ActionResult<List<StockItemDto>>> Stock(CancellationToken ct)
    {
        var stock = await _stock.Query()
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .OrderBy(s => s.Product.Name)
            .Select(s => new StockItemDto(
                s.Id, s.ProductId, s.Product.Name, s.Warehouse.Name, s.Quantity, s.ReservedQuantity, s.MinStock))
            .ToListAsync(ct);

        return Ok(stock);
    }

    /// <summary>
    /// Records a stock movement (In/Out/Adjustment) against a product and
    /// warehouse, updating the on-hand quantity and writing a transaction.
    /// </summary>
    [HttpPost("stock")]
    [Authorize(Policy = Permissions.InventoryManage)]
    public async Task<IActionResult> AdjustStock(AdjustStockDto dto, CancellationToken ct)
    {
        if (dto.Quantity < 0)
        {
            return BadRequest(new { error = "Quantity cannot be negative." });
        }

        var product = await _products.GetByIdAsync(dto.ProductId, ct);
        if (product is null)
        {
            return NotFound(new { error = "Product not found." });
        }

        var warehouse = await _warehouses.GetByIdAsync(dto.WarehouseId, ct);
        if (warehouse is null)
        {
            return NotFound(new { error = "Warehouse not found." });
        }

        var item = await _stock.Query()
            .FirstOrDefaultAsync(s => s.ProductId == dto.ProductId && s.WarehouseId == dto.WarehouseId, ct);

        switch (dto.Type)
        {
            case StockTransactionType.In:
                if (item is null)
                {
                    item = new StockItem
                    {
                        ProductId = dto.ProductId,
                        WarehouseId = dto.WarehouseId,
                        Quantity = dto.Quantity
                    };
                    await _stock.AddAsync(item, ct);
                }
                else
                {
                    item.Quantity += dto.Quantity;
                }
                break;

            case StockTransactionType.Out:
                if (item is null || item.Quantity < dto.Quantity)
                {
                    return BadRequest(new { error = "Not enough stock available for this movement." });
                }
                item.Quantity -= dto.Quantity;
                break;

            case StockTransactionType.Adjustment:
                if (item is null)
                {
                    item = new StockItem
                    {
                        ProductId = dto.ProductId,
                        WarehouseId = dto.WarehouseId,
                        Quantity = dto.Quantity
                    };
                    await _stock.AddAsync(item, ct);
                }
                else
                {
                    item.Quantity = dto.Quantity;
                }
                break;

            default:
                return BadRequest(new { error = "Unsupported stock transaction type." });
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _transactions.AddAsync(new StockTransaction
        {
            ProductId = dto.ProductId,
            WarehouseId = dto.WarehouseId,
            Type = dto.Type,
            Quantity = dto.Quantity,
            Reference = $"Stock {dto.Type.ToString().ToLowerInvariant()}"
        }, ct);

        await _stock.SaveChangesAsync(ct);

        return Ok(new { message = "Stock updated.", onHand = item.Quantity });
    }
}

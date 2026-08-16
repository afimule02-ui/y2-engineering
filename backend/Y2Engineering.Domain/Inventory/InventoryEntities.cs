using Y2Engineering.Domain.Common;

namespace Y2Engineering.Domain.Inventory;

public class Product : EntityBase
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public string? Unit { get; set; }

    public string? Sku { get; set; }

    public decimal UnitPrice { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
}

public class Warehouse : EntityBase
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Location { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
}

public class StockItem : EntityBase
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid WarehouseId { get; set; }

    public Warehouse Warehouse { get; set; } = null!;

    public int Quantity { get; set; }

    public int ReservedQuantity { get; set; }

    public int MinStock { get; set; }
}

public class StockTransaction : EntityBase
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid? WarehouseId { get; set; }

    public Warehouse? Warehouse { get; set; }

    public StockTransactionType Type { get; set; }

    public int Quantity { get; set; }

    public string? Reference { get; set; }

    public string? Notes { get; set; }
}

public class Supplier : EntityBase
{
    public string Name { get; set; } = string.Empty;

    public string? ContactPerson { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;
}

using Y2Engineering.Domain.Common;
using Y2Engineering.Domain.Crm;

namespace Y2Engineering.Domain.Machines;

public class Manufacturer : EntityBase
{
    public string Name { get; set; } = string.Empty;

    public string? Country { get; set; }

    public string? Website { get; set; }

    public ICollection<MachineModel> Models { get; set; } = new List<MachineModel>();

    public ICollection<Machine> Machines { get; set; } = new List<Machine>();
}

public class MachineModel : EntityBase
{
    public Guid ManufacturerId { get; set; }

    public Manufacturer Manufacturer { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string? Type { get; set; }

    public ICollection<Machine> Machines { get; set; } = new List<Machine>();
}

public class Machine : EntityBase
{
    public string MachineNo { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public Guid? ManufacturerId { get; set; }

    public Manufacturer? Manufacturer { get; set; }

    public Guid? ModelId { get; set; }

    public MachineModel? Model { get; set; }

    public string? SerialNumber { get; set; }

    public DateTime? InstallationDate { get; set; }

    public MachineStatus Status { get; set; } = MachineStatus.Operational;

    public string? Location { get; set; }

    public string? QrCode { get; set; }

    public string? Notes { get; set; }

    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
}

public class MaintenanceRecord : EntityBase
{
    public Guid MachineId { get; set; }

    public Machine Machine { get; set; } = null!;

    public MaintenanceType Type { get; set; } = MaintenanceType.Preventive;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime Date { get; set; }

    public decimal Cost { get; set; }

    public Guid? TechnicianId { get; set; }

    public Guid? WorkOrderId { get; set; }

    public DateTime? NextDueDate { get; set; }

    public string? Notes { get; set; }
}

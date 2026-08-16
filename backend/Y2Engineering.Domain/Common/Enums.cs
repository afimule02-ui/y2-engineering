namespace Y2Engineering.Domain.Common;

// ---------- CRM ----------
public enum LeadStatus
{
    New = 0,
    Contacted = 1,
    Qualified = 2,
    QuotationSent = 3,
    Converted = 4,
    Lost = 5
}

public enum LeadSource
{
    Website = 0,
    Referral = 1,
    Phone = 2,
    WalkIn = 3,
    SocialMedia = 4,
    Other = 5
}

// ---------- Services ----------
public enum ServiceRequestStatus
{
    Pending = 0,
    UnderReview = 1,
    Quoted = 2,
    Scheduled = 3,
    InProgress = 4,
    Completed = 5,
    Cancelled = 6
}

public enum Priority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

// ---------- Projects ----------
public enum ProjectStatus
{
    NotStarted = 0,
    InProgress = 1,
    OnHold = 2,
    Completed = 3,
    Cancelled = 4
}

public enum ProjectTaskStatus
{
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    Blocked = 3
}

public enum WorkOrderStatus
{
    Open = 0,
    Assigned = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}

// ---------- Machines ----------
public enum MachineStatus
{
    Operational = 0,
    UnderMaintenance = 1,
    OutOfService = 2,
    Decommissioned = 3
}

public enum MaintenanceType
{
    Preventive = 0,
    Corrective = 1,
    Emergency = 2,
    Inspection = 3
}

// ---------- Sales ----------
public enum QuotationStatus
{
    Draft = 0,
    Sent = 1,
    Accepted = 2,
    Rejected = 3,
    Expired = 4,
    Converted = 5
}

public enum ContractStatus
{
    Draft = 0,
    Active = 1,
    Completed = 2,
    Terminated = 3
}

// ---------- Finance ----------
public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    PartialPaid = 2,
    Paid = 3,
    Overdue = 4,
    Cancelled = 5
}

public enum PaymentMethod
{
    Cash = 0,
    BankTransfer = 1,
    MobileMoney = 2,
    Cheque = 3,
    Card = 4
}

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3
}

// ---------- Staffing ----------
public enum VacancyStatus
{
    Open = 0,
    Closed = 1,
    Filled = 2
}

public enum CandidateStatus
{
    New = 0,
    Reviewed = 1,
    Interviewed = 2,
    Offered = 3,
    Hired = 4,
    Rejected = 5
}

public enum JobApplicationStatus
{
    Submitted = 0,
    UnderReview = 1,
    Interview = 2,
    Offered = 3,
    Hired = 4,
    Rejected = 5
}

// ---------- Inventory ----------
public enum StockTransactionType
{
    In = 0,
    Out = 1,
    Transfer = 2,
    Adjustment = 3
}

// ---------- Communication ----------
public enum NotificationChannel
{
    InApp = 0,
    Email = 1,
    Sms = 2,
    Push = 3
}

// ---------- Generic ----------
public enum UserStatus
{
    Active = 0,
    Inactive = 1,
    Locked = 2
}

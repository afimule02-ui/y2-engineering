# Y2 Engineering Platform — Architecture

## 1. Vision

One platform, three surfaces, one backend:

```
                        Y2 ENGINEERING PLATFORM
                                 │
                    ASP.NET Core REST API (.NET 10)
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
     PUBLIC WEBSITE        CUSTOMER PORTAL      ADMIN PORTAL
        Angular               Angular             Angular
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                            SQL Server
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
         File Storage        Redis (later)      SignalR
```

Later, the same API serves Flutter apps (customer app, technician app).

## 2. Backend — Clean Architecture

`Y2Engineering.slnx` (solution file, .NET 10):

| Project | Responsibility |
| --- | --- |
| **Domain** | Entities, enums, value logic, `Permissions` registry. No dependencies. |
| **Application** | DTOs, FluentValidation validators, use-case services (`ServiceRequestService`, `QuotationService`), ports (`IRepository<T>`, `INumberGenerator`, `IEmailService`, `IStorageService`, `IQrCodeService`, `INotificationService`, `ITokenService`, `ICurrentUser`). |
| **Infrastructure** | JWT token service, SMTP email, local file storage, QRCoder, in-app notifications. |
| **Persistence** | EF Core `ApplicationDbContext`, `EfRepository<T>`, `DbNumberGenerator`, `DbSeeder`, migrations. |
| **API** | Controllers, JWT + permission policies, exception middleware, `NotificationHub`, `CurrentUser`, Swagger. |
| **Tests** | xUnit unit tests for validators, quotation math and slug generation. |

Dependency rule: `API → Application → Domain` and `API → Infrastructure → Application`, `API → Persistence → Application`. Domain references nothing.

### Request flow

```
Controller → [Authorize(Policy = "Services.Create")]
          → Application service (validates via FluentValidation, applies business rules)
          → IRepository<T> / INumberGenerator / INotificationService
          → Persistence (EF Core) → SQL Server
```

## 3. Database — module schemas

All tables live in schemas per module (SQL Server):

| Schema | Tables |
| --- | --- |
| `Identity` | Users, Roles, UserRoles, RoleClaims, UserClaims, UserLogins, UserTokens, Permissions, RolePermissions |
| `Crm` | Companies, Customers, Contacts, Leads |
| `Services` | Categories, Services, ServiceRequests, RequestAttachments |
| `Projects` | Projects, Tasks, WorkOrders |
| `Machines` | Manufacturers, Models, Machines, MaintenanceRecords |
| `Training` | Courses, Trainers, Students, Classes, Certificates |
| `Staffing` | Vacancies, Candidates, JobApplications |
| `Inventory` | Products, Warehouses, StockItems, StockTransactions, Suppliers |
| `Sales` | Quotations, QuotationItems, Contracts |
| `Finance` | Invoices, InvoiceItems, Payments |
| `Cms` | Pages, PageSections, MediaAssets, BlogPosts, Faqs, Testimonials |
| `Communication` | Conversations, Messages, Notifications |
| `Audit` | AuditLogs |

Key rules:

- **Business numbers** are generated per year: `SR-2026-00125` (service request), `QT-2026-00045` (quotation), `WO-…`, `PR-…`, `MC-…`, `INV-…`, `PAY-…`, `CT-…`, `Y2-…` (certificate). `DbNumberGenerator` scans the current year's max sequence; swap for a locked sequence table at scale.
- **Files never live in SQL Server** — `MediaAsset` / `RequestAttachment` store metadata + `StoragePath`; bytes go to local disk (`uploads/`, `IStorageService`), later Azure Blob / S3 / MinIO.
- **Quotation math** is computed on the entity (`Subtotal − Discount + VAT`) so totals can never drift.
- Migration: `Persistence/Migrations/2026*_InitialCreate` (run `dotnet ef migrations add` from `backend/`).

## 4. Authentication & authorization

- **ASP.NET Core Identity** with custom `ApplicationUser` / `ApplicationRole` (GUID keys, explicit `UserRoles` join entity).
- **JWT bearer** is the *default* scheme (explicitly configured — `AddIdentity` otherwise registers cookies as default, which breaks `[Authorize]`).
- Tokens carry `sub`, `email`, `fullname`, **role claims** and **permission claims** (e.g. `permission: Services.Create`).
- One authorization **policy per permission** (`AddPolicy(permission, p => p.RequireClaim("permission", permission))`), so endpoints declare `[Authorize(Policy = Permissions.ServicesCreate)]`.
- `PermissionResolver` maps a user's roles → `RolePermissions` → permission names at login. `SuperAdmin` receives all permissions via seed.
- Roles seeded: SuperAdmin, Admin, Manager, ProjectManager, Engineer, Technician, Accountant, HR, Trainer, Sales, Customer, Candidate.

## 5. Key flows

### Service request
Public form → `POST /api/service-requests` → number assigned (`SR-2026-xxxxx`) → notification created → admin updates status (`Pending → Under Review → Quoted → Scheduled → In Progress → Completed`) → customer notified in-app.

### Quotation
Engineer creates `POST /api/quotations` (optionally linked to a service request) → originating request is marked `Quoted` → customer sees it in the portal → **Accept / Reject** → accepted quotation can drive a Project.

### Machine QR
`GET /api/machines/{id}/qr` returns a PNG that links to the machine record — the foundation for technician field workflows (scan → history → create service ticket).

### Certificate verification
`GET /api/training/certificates/{no}` (public) powers `/verify-certificate/Y2-2026-00001` on the website.

## 6. Frontend — Angular feature-based structure

```
src/app/
├── core/            # api.service, auth.service, jwt.interceptor, guards, models
├── shared/          # page-header, status-badge, etb pipe
├── layout/          # public-layout, admin-layout, customer-layout
└── features/        # home, about, services, projects, training, careers, blog,
                     # contact, auth, customer/*, admin/*
```

- Standalone components, **lazy-loaded routes** per feature (see `app.routes.ts`).
- Dev proxy (`src/proxy.conf.json`) forwards `/api` and `/hubs` to the backend, so the SPA and API share an origin in development.
- Auth state in `AuthService` (signal + localStorage token); `authGuard`, `adminGuard`, `guestGuard` protect routes; `jwtInterceptor` attaches the token.

## 7. API endpoint map

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Services | `GET /api/services`, `GET /api/services/{slug}`, `GET /api/services/manage`, `POST/PUT/DELETE /api/services…` |
| Service requests | `POST /api/service-requests`, `GET …/mine`, `GET /api/service-requests`, `PUT …/{id}/status` |
| Quotations | `POST /api/quotations`, `GET …/mine`, `GET /api/quotations`, `POST …/{id}/accept|reject` |
| CRM | `GET/POST/PUT/DELETE /api/customers…`, `GET/POST /api/companies` |
| Machines | `GET/POST/PUT /api/machines…`, `GET/POST …/{id}/maintenance`, `GET …/{id}/qr` |
| Projects | `GET/POST/PUT /api/projects…`, `GET /api/projects/public`, `GET/POST …/{id}/tasks` |
| Operations | `GET/POST/PUT /api/work-orders…` |
| Training | `GET/POST /api/training/courses…`, `GET /api/training/certificates` (admin), `GET /api/training/certificates/{no}` (public verify) |
| Staffing | `GET/POST /api/staffing/vacancies…`, `POST /api/staffing/applications`, `GET /api/staffing/candidates`, `GET /api/staffing/applications`, `PUT /api/staffing/candidates/{id}` (status) |
| Inventory | `GET/POST /api/inventory/products…`, `GET/POST /api/inventory/warehouses…`, `GET /api/inventory/stock`, `POST /api/inventory/stock` (movement: In/Out/Adjust → updates on-hand + writes `StockTransaction`) |
| Finance | `GET/POST /api/finance/invoices…`, `GET /api/finance/payments`, `POST /api/finance/payments` (updates invoice paid/balance/status) |
| CMS | `GET /api/cms/pages/{slug}`, `GET/POST/PUT /api/cms/pages…`, `GET /api/cms/blog…` (+ `blog/manage`, `PUT/DELETE blog/{id}`), `GET /api/cms/faqs` (+ `faqs/manage`, `POST/PUT/DELETE faqs`), `GET /api/cms/testimonials` |
| Notifications | `GET /api/notifications/mine`, `POST …/{id}/read` |
| Media | `POST /api/media/upload` |
| Admin | `GET /api/admin/dashboard` (KPIs + recent requests), `GET /api/admin/reports` (status distributions + revenue/outstanding) |
| Realtime | SignalR hub `/hubs/notifications` (per-user groups) |

## 8. Cross-cutting

- **Validation**: FluentValidation validators in Application, invoked in controllers (400 with error list).
- **Errors**: `DomainException` → 400; anything else → 500 (logged), via `ExceptionHandlingMiddleware`.
- **Auditing**: `AuditLogs` table is ready; wire an `IAuditService` into the services that mutate money/status next.
- **Multilingual**: `ApplicationUser.Language` exists; a `ServiceTranslation` pattern (entity + language rows) is the recommended next step for EN/AM/OM.
- **SEO**: CMS pages/blog carry meta fields; add SSR (Angular Universal / Analog) for the public site before launch.

## 9. Recommended next steps

1. **Training module**: issue certificates with QR codes on course completion; student/trainer management.
2. **Finance**: invoice generation from quotations/projects, purchase orders, expense tracking.
3. **Quotation PDF**: add a PDF generator (QuestPDF) and download endpoint.
4. **SignalR wiring in the SPA**: connect to `/hubs/notifications` and show live toasts on request/quote status changes.
5. **Flutter apps**: customer + technician apps against the same API (QR scanning, GPS, signatures).
6. **Hardening**: real JWT secret in user secrets, HTTPS, rate limiting, Redis-backed sequences, Azure Blob storage.

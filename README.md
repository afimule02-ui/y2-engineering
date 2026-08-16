# Y2 Engineering Platform

**Y2 Electro Mechanical Engineering** — a full Engineering Services & Industrial Solutions platform built with **ASP.NET Core (.NET 10) + Angular**. It starts as a professional corporate website and is structured to grow into a customer portal, quotation system, project management, training (LMS), staffing, inventory and maintenance platform.

## Stack

| Layer | Technology |
| --- | --- |
| Backend | ASP.NET Core Web API (.NET 10), Clean Architecture |
| Data | SQL Server + Entity Framework Core (module schemas), migrations |
| Auth | ASP.NET Core Identity, JWT, role + **permission-based** authorization |
| Frontend | Angular 22 (standalone components), Angular Material, SCSS, RxJS |
| Realtime | SignalR (`/hubs/notifications`) |
| Extras | Swagger, FluentValidation, QRCoder, local file storage (swap for Blob/S3 later) |

## Repository layout

```
├── backend/
│   ├── Y2Engineering.slnx
│   ├── Y2Engineering.Domain/          # entities, enums, permissions registry
│   ├── Y2Engineering.Application/     # DTOs, validators, use-case services
│   ├── Y2Engineering.Infrastructure/  # JWT, email, storage, QR, notifications
│   ├── Y2Engineering.Persistence/     # EF Core DbContext, migrations, seed
│   ├── Y2Engineering.API/             # controllers, auth, middleware, SignalR hub
│   └── Y2Engineering.Tests/           # xUnit unit tests
├── frontend/
│   └── y2-engineering-ui/             # Angular 22 app (public + customer + admin)
└── docs/
    └── architecture.md                # full architecture, schema and API map
```

## Prerequisites

- .NET SDK 10
- SQL Server (LocalDB or a local instance such as `localhost\SQLEXPRESS`)
- Node.js 20+ and npm
- Angular CLI 22 (`npm i -g @angular/cli`)

## Run the backend

```bash
cd backend
dotnet restore
dotnet tool restore                 # installs dotnet-ef (local)
dotnet ef database update           # applies the InitialCreate migration
dotnet run --project Y2Engineering.API
```

The API listens on `http://localhost:5055` (see `Properties/launchSettings.json`). Swagger UI: `http://localhost:5055/swagger`.

**Connection string:** edit `ConnectionStrings:DefaultConnection` in `backend/Y2Engineering.API/appsettings.json` (default is LocalDB; the example above used `Server=localhost\SQLEXPRESS`). On startup the API applies pending migrations and seeds the database automatically (`Database:ApplyMigrationsOnStartup`), so `dotnet ef database update` is optional.

### Seeded demo accounts

| Role | Email | Password |
| --- | --- | --- |
| SuperAdmin | `admin@y2engineering.com` | `Admin@123!` |
| Customer | `customer@y2engineering.com` | `Customer@123!` |
| Engineer | `engineer@y2engineering.com` | `Engineer@123!` |

Seed data also includes the six services from the business card, three CMS pages and FAQs.

## Run the frontend

```bash
cd frontend/y2-engineering-ui
npm install
ng serve
```

Open `http://localhost:4200`. In development, `src/proxy.conf.json` forwards `/api` (and `/hubs`) to the backend at `http://localhost:5055`, so no CORS configuration is needed. (If port 4200 is busy, use `ng serve --port 4300`.)

### What's in the UI

- **Public website** — home (hero + services), services list/detail, request-service form, projects, training courses, certificate verification (`/verify-certificate/:no`), careers + job application, knowledge center, contact + FAQ
- **Customer portal** (`/customer`) — dashboard, service requests, quotations with accept/reject
- **Admin portal** (`/admin`) — KPI dashboard, service request management (status workflow), services CRUD, customers, machines, quotations (create from a quote), projects, work orders, **inventory** (products / warehouses / stock movements), **finance** (invoices + payments), **training** (courses + certificates), **staffing** (vacancies + candidates + applications), **CMS** (pages / blog / FAQs) and **reports** (status distributions + revenue)

## API overview

Everything under `/api`, e.g.:

```
/api/auth                register, login, me
/api/services            public catalog + admin CRUD
/api/service-requests    public submission, admin workflow
/api/quotations          create, list, customer accept/reject
/api/customers /companies
/api/machines            registry, maintenance history, QR code
/api/projects /work-orders
/api/training            courses, certificate verification
/api/staffing            vacancies, applications
/api/inventory /finance
/api/cms                 pages, blog, FAQs, testimonials
/api/notifications       in-app notifications
/api/admin/dashboard     cross-module KPIs
/api/media/upload        file uploads
```

**Authorization:** login returns a JWT containing the user's roles and resolved permissions (e.g. `Services.Create`). Endpoints use `[Authorize(Policy = "...")]` so access is governed by permissions, not just roles. `SuperAdmin` holds every permission.

## Verifying

```bash
cd backend
dotnet test                      # unit tests (validators, totals, slugs)
dotnet build Y2Engineering.slnx

cd ../frontend/y2-engineering-ui
ng build                         # production build
```

## Development phases (from the blueprint)

1. ✅ Corporate website + CMS + auth
2. ✅ Customer portal: requests, quotations, notifications
3. ✅ Business operations: CRM, projects, machines, maintenance, work orders
4. ⏳ Training & staffing management UIs, certificate issuance
5. ⏳ Inventory & finance management UIs
6. ⏳ Flutter mobile apps (customer / technician), QR field service
7. ⏳ Advanced: IoT, predictive maintenance, online payments, analytics

See `docs/architecture.md` for the complete design — database schemas, entity map, permission matrix and API endpoints.

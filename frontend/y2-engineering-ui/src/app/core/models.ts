export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  language?: string;
  companyId?: string;
}

export interface TokenResponse {
  token: string;
  expiresAt: string;
  user: UserProfile;
}

export interface ServiceSummary {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  shortDescription: string;
  sortOrder: number;
}

export interface ServiceDetail {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  shortDescription: string;
  description: string;
  process?: string;
  industriesServed?: string;
  faq?: string;
  isActive: boolean;
  sortOrder: number;
  categoryId?: string;
  categoryName?: string;
}

export interface ServiceRequest {
  id: string;
  requestNo: string;
  serviceName?: string;
  machineName?: string;
  problemDescription: string;
  priority: number;
  status: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  createdAt: string;
  customerId?: string;
}

export interface QuotationSummary {
  id: string;
  quotationNo: string;
  title: string;
  customerName?: string;
  status: number;
  total: number;
  issueDate: string;
  expiryDate: string;
}

export interface QuotationDetail {
  id: string;
  quotationNo: string;
  customerId?: string;
  serviceRequestId?: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  status: number;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  items: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Customer {
  id: string;
  customerCode: string;
  companyId?: string;
  companyName?: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  isActive: boolean;
  notes?: string;
}

export interface Machine {
  id: string;
  machineNo: string;
  customerId?: string;
  customerName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  modelId?: string;
  modelName?: string;
  serialNumber?: string;
  installationDate?: string;
  status: number;
  location?: string;
  qrCode?: string;
  notes?: string;
}

export interface Project {
  id: string;
  projectNo: string;
  name: string;
  customerId?: string;
  customerName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: number;
  progress: number;
  budget: number;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  projectId?: string;
  machineId?: string;
  machineName?: string;
  customerId?: string;
  customerName?: string;
  title: string;
  problemDescription: string;
  priority: number;
  status: number;
  scheduledDate?: string;
  completedAt?: string;
  partsUsed?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  durationDays: number;
  modules?: string;
  price: number;
  isActive: boolean;
}

export interface Vacancy {
  id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string;
  location?: string;
  status: number;
  postedDate?: string;
  closingDate?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
}

export interface DashboardData {
  customers: number;
  serviceRequests: number;
  pendingRequests: number;
  projects: number;
  activeProjects: number;
  machines: number;
  pendingQuotations: number;
  totalRevenue: number;
  recentRequests: ServiceRequest[];
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  unitPrice: number;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  warehouseName?: string;
  quantity: number;
  reservedQuantity: number;
  minStock: number;
}

export interface Payment {
  id: string;
  paymentNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  customerName?: string;
  amount: number;
  method: number;
  status: number;
  paymentDate: string;
  reference?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  profession?: string;
  experienceYears: number;
  skills?: string;
  certifications?: string;
  status: number;
}

export interface JobApplication {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  candidateId: string;
  candidateName: string;
  status: number;
  appliedDate: string;
}

export interface StatusCount {
  status: number;
  count: number;
}

export interface ReportData {
  totalRequests: number;
  requestStatuses: StatusCount[];
  totalQuotations: number;
  quotationStatuses: StatusCount[];
  totalRevenue: number;
  outstandingBalance: number;
  totalInvoices: number;
  invoiceStatuses: StatusCount[];
  totalProjects: number;
  projectStatuses: StatusCount[];
  totalMachines: number;
  machineStatuses: StatusCount[];
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName?: string;
  issueDate: string;
  dueDate: string;
  status: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balance: number;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  qrCode?: string;
  isVerified: boolean;
}

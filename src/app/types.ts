export type UserRole = 'admin' | 'staff' | 'tenant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface CommercialSpace {
  id: string;
  unitNumber: string;
  floor: number;
  size: number; // sq ft
  rentalRate: number; // monthly
  status: 'vacant' | 'occupied' | 'reserved' | 'maintenance';
  type: 'office' | 'retail' | 'warehouse' | 'restaurant';
  tenantId?: string;
  leaseStart?: string;
  leaseEnd?: string;
}

export interface LeaseContract {
  id: string;
  spaceId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  documentUrl?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance';
  leaseId: string;
}

export interface MaintenanceRequest {
  id: string;
  spaceId: string;
  reportedBy: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'permit' | 'compliance' | 'invoice' | 'report';
  uploadedBy: string;
  uploadedAt: string;
  relatedTo?: string; // userId or spaceId
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Schedule {
  id: string;
  title: string;
  type: 'appointment' | 'maintenance' | 'inspection' | 'meeting';
  startTime: string;
  endTime: string;
  location?: string;
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

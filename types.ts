
export type Role = 'ADMIN' | 'SECRETARY' | 'DOCTOR';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  email: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  medicalHistory: string[];
  bloodType: string;
}

export interface DoctorSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DoctorDocument {
  id: string;
  name: string;
  fileType: string;
  uploadDate: string;
  url?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio?: string;
  detailedSchedule: DoctorSchedule[];
  documents: DoctorDocument[];
  photoUrl: string;
  schedule: string[];
  consultationFee: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  reason?: string;
  notes?: string;
  aiInsights?: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'PENDING' | 'COLLECTED' | 'COMPLETED' | 'CANCELLED';
  tests: Array<{ name: string; cost: number }>;
  totalCost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY';
  stock: number;
  minThreshold: number;
  price: number;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  date: string;
  total: number;
  status: 'PAID' | 'UNPAID';
  items: Array<{ description: string; amount: number }>;
}

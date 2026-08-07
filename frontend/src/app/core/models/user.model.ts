export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'donor' | 'ngo' | 'admin';
  organizationName?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: 'donor' | 'ngo' | 'admin';
  address: string;
  city: string;
  state: string;
  pincode: string;
  organizationName?: string;
}

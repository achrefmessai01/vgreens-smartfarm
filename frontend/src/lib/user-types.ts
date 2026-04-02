export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

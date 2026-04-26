export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  OWNER = "OWNER",
  BUYER = "BUYER",
  RENTER = "RENTER",
}

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type Admin = {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Renter = {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

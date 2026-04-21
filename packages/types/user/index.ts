type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  image: string;
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
};

type AdminLandlordRenter = {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

type Admin = AdminLandlordRenter & {};

type Landlord = AdminLandlordRenter & {};

type Renter = AdminLandlordRenter & {};

enum UserRole {
  ADMIN,
  LANDLORD,
  RENTER,
}

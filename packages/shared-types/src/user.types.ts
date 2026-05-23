export interface IUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

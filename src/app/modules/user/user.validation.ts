import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createZodSchema = z.object({
    name: z.string({ message: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }),
    email: z.string({ message: "Email must be string" }).email({ message: "invalid email formate" }),
    password: z.string().min(8, { message: "Password must minimum 8 characters" }).regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter" }).regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" }).regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number" }),
    phone: z.string({ message: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    address: z.string({ message: "Address must be string" }).optional(),
});

export const updateZodSchema = z.object({
    name: z.string({ message: "Name must be string" }).min(3, { message: "Name must be minimum 3 character" }).optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional(),
    phone: z.string({ message: "Phone must be string" }).regex(/^(?:\+8801\d{9}|01\d{9})$/, { message: "Phone Number not valid" }).optional(),
    isDeleted: z.boolean({ message: "isDeleted must be true or false" }).optional(),
    isVerified: z.boolean({ message: "isVerified must be true or false" }).optional(),
    address: z.string({ message: "Address must be string" }).optional(),
});
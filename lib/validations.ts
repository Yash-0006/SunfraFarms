import { z } from 'zod';

export const SignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  email: z.string().email("Enter a valid email address").max(100),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol (!@#$%^&*...)")
});

export const ProfileUpdateSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  email: z.string().email("Enter a valid email address").max(100),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol (!@#$%^&*...)")
    .optional()
    .or(z.literal('')) // allow empty string to not update password
});

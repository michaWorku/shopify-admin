import { object, z, string } from 'zod'

export const signupSchema = z.object({
  firstName: string().min(3, "Must be 3 or more characters long"),
  lastName: string().min(3, "Must be 3 or more characters long"),
  email: string().min(1, 'Email is required').email('Email is invalid'),
  password: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters')
})

export const addUserSchema = z.object({
  firstName: string().min(3, "Must be 3 or more characters long"),
  middleName: string().min(3, "Must be 3 or more characters long"),
  lastName: string().min(3, "Must be 3 or more characters long"),
  email: string().min(1, 'Email is required').email('Email is invalid'),
  phone: z.string({ required_error: 'Phone is required' }).min(9, 'Invalid phone number'),
  role: z.enum(['ADMIN', 'USER', 'AGENT']),
  password: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters')
})

export const updateUserSchema = z.object({
  firstName: string().min(3, "Must be 3 or more characters long").optional(),
  middleName: string().min(3, "Must be 3 or more characters long").optional(),
  lastName: string().min(3, "Must be 3 or more characters long").optional(),
  email: string().min(1, 'Email is required').email('Email is invalid').optional(),
  phone: z.string({ required_error: 'Phone is required' }).min(9, 'Invalid phone number').optional(),
  role: z.enum(['ADMIN', 'USER', 'AGENT']).optional(),
  password: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters').optional()
})

export const sendSmsSchema = z.object({
  phone: z.string().min(12),
  text: z.string().min(15),
  _sms: z.string().min(4)
})

export const signinSchema = object({
  email: string().min(1, 'Email is required').email('Email is invalid'),
  password: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters')
})

export const resetSchema = object({
  newPassword: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  confirmPassword: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const supportSchema = z.object({
  globalFilter: z.string().min(9),
})

export const searchSchema = z.object({
  globalFilter: z.string().min(3),
})
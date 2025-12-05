import {z} from 'zod';
import {ValidationLanguages} from './types';

/**
 * Login form validation schema
 * Validates email and password fields for user login
 */
export const createLoginSchema = (languages?: ValidationLanguages) =>
  z.object({
    email: z
      .string()
      .min(1, languages?.email_empty || 'Email is required')
      .email(languages?.email_validation_error_msg || 'Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  });

/**
 * Registration form validation schema
 * Validates email, password, confirm password, and phone number for user registration
 * Includes password strength requirements and password matching validation
 */
export const createRegisterSchema = (languages?: ValidationLanguages) =>
  z.object({
    email: z
      .string()
      .min(1, languages?.email_required || 'Email is required')
      .email(languages?.email_validation_error_msg || 'Invalid email format'),
    password: z
      .string()
      .min(1, languages?.password_is_required || 'Password is required')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*._-]).{8,}$/,
        languages?.password_requirements_message_with_length_and_requirements ||
          'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z
      .string()
      .min(
        1,
        languages?.confirm_password_is_required ||
          'Confirm password is required',
      ),
    formattedPhonenumber: z
      .string()
      .min(1, languages?.required_phone_number || 'Phone number is required'),
  });
// .refine(data => data.password === data.confirmPassword, {
//   message:
//     languages?.password_does_not_match_error_message ||
//     'Passwords do not match',
//   path: ['confirmPassword'],
// });

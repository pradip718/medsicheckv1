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
 * OTP Login form validation schema
 * Validates either email (with format check) OR phone number (empty check only)
 * Only one of email or phone is required, not both
 */
export const createOTPLoginSchema = (languages?: ValidationLanguages) =>
  z
    .object({
      email: z.string().optional(),
      formattedPhonenumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const hasPhone =
        data.formattedPhonenumber && data.formattedPhonenumber.trim() !== '';

      // Validate email if provided - check format
      if (hasEmail) {
        const emailResult = z
          .string()
          .min(1, languages?.email_empty || 'Email is required')
          .email(
            languages?.email_validation_error_msg || 'Invalid email format',
          )
          .safeParse(data.email);

        if (!emailResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: emailResult.error.issues[0]?.message || 'Invalid email',
            path: ['email'],
          });
        }
      }

      // Validate phone if provided - only check if empty
      if (hasPhone) {
        const phoneResult = z
          .string()
          .min(
            1,
            languages?.required_phone_number || 'Phone number is required',
          )
          .safeParse(data.formattedPhonenumber);

        if (!phoneResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              phoneResult.error.issues[0]?.message ||
              'Phone number is required',
            path: ['formattedPhonenumber'],
          });
        }
      }

      // At least one of email or phone must be provided
      if (!hasEmail && !hasPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            languages?.email_empty || 'Email or phone number is required',
          path: ['email'],
        });
      }
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

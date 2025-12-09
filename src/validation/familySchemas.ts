import {z} from 'zod';
import {
  HEIGHT_LIMITS_FEET,
  MEDSI_ALERT_LIMITS,
  WEIGHT_LIMITS_LBS,
} from '../constants';
import {ValidationLanguages} from './types';

/**
 * Family information form validation schema
 * Validates family member information including name, gender, email, phone, birthdate, height, and weight
 * Includes dynamic validation for height and weight based on selected units (cm/ft, kg/lbs)
 * Enforces Binah SDK limits for height, weight, and age
 * Email and phone number are optional fields
 */
export const createFamilyInformationSchema = (
  languages?: ValidationLanguages,
) =>
  z
    .object({
      given_name: z
        .string()
        .min(1, languages?.first_name_required || 'First name is required')
        .min(2, languages?.min_name_character || 'Minimum 2 characters'),
      family_name: z
        .string()
        .min(1, languages?.last_name_required || 'Last name is required'),
      gender: z.string().min(1, 'Gender is required'),
      email: z
        .string()
        .optional()
        .refine(val => !val || z.string().email().safeParse(val).success, {
          message:
            languages?.email_validation_error_msg || 'Invalid email format',
        }),
      phone_number: z.string().optional(),
      birthdate: z.string().min(1, 'Birthdate is required'),
      height: z
        .string()
        .min(1, languages?.height_required || 'Height is required'),
      weight: z
        .string()
        .min(1, languages?.weight_required || 'Weight is required'),
      height_unit: z.string().min(1, 'Height unit is required'),
      weight_unit: z.string().min(1, 'Weight unit is required'),
      middle_name: z.string().optional(),
      relation: z.string().optional(),
      other_relation: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Height validation based on unit
      const heightValue = parseFloat(data.height);
      if (isNaN(heightValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            (languages as any)?.valid_height_error ||
            'Please enter a valid height.',
          path: ['height'],
        });
      } else {
        const minHeight =
          data.height_unit === 'cm'
            ? MEDSI_ALERT_LIMITS.MIN_HEIGHT_CM
            : HEIGHT_LIMITS_FEET.min;
        const maxHeight =
          data.height_unit === 'cm'
            ? MEDSI_ALERT_LIMITS.MAX_HEIGHT_CM
            : HEIGHT_LIMITS_FEET.max;

        if (heightValue < minHeight) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              data.height_unit === 'cm'
                ? languages?.min_height_cm_error
                : languages?.min_height_ft_error,
            path: ['height'],
          });
        } else if (heightValue > maxHeight) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              data.height_unit === 'cm'
                ? languages?.max_height_cm_error
                : languages?.max_height_ft_error,
            path: ['height'],
          });
        }
      }

      // Weight validation based on unit
      const weightValue = parseFloat(data.weight);
      if (isNaN(weightValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            (languages as any)?.valid_weight_error ||
            'Please enter a valid weight.',
          path: ['weight'],
        });
      } else {
        const minWeight =
          data.weight_unit === 'kg'
            ? MEDSI_ALERT_LIMITS.MIN_WEIGHT_KG
            : WEIGHT_LIMITS_LBS.min;
        const maxWeight =
          data.weight_unit === 'kg'
            ? MEDSI_ALERT_LIMITS.MAX_WEIGHT_KG
            : WEIGHT_LIMITS_LBS.max;

        if (weightValue < minWeight) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              data.weight_unit === 'kg'
                ? languages?.min_weight_kgs_error
                : languages?.min_weight_lbs_error,
            path: ['weight'],
          });
        } else if (weightValue > maxWeight) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              data.weight_unit === 'kg'
                ? languages?.max_weight_kgs_error
                : languages?.max_weight_lbs_error,
            path: ['weight'],
          });
        }
      }
    });

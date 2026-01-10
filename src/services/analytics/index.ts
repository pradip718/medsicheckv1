/**
 * Analytics Service
 * General analytics function similar to notifyApi pattern
 * Supports multiple analytics providers through provider abstraction
 */

import moment from 'moment';
import useUserProfileStore from '../../../store/profileStore';
import {
  identifyMixpanelUser,
  initializeMixpanel,
  resetMixpanelUser,
  setMixpanelUserProperties,
  trackMixpanelEvent,
} from './providers/mixpanel';
import {
  ANALYTICS_EVENTS,
  AnalyticsEventName,
  AnalyticsProperties,
  UserProperties,
} from './types';

// Provider interface for future extensibility
interface AnalyticsProvider {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  setUserProperties: (properties: UserProperties) => void;
  reset: () => void;
}

// Mixpanel provider implementation
const mixpanelProvider: AnalyticsProvider = {
  track: trackMixpanelEvent,
  identify: identifyMixpanelUser,
  setUserProperties: setMixpanelUserProperties,
  reset: resetMixpanelUser,
};

// Provider registry - add new providers here
const providers: AnalyticsProvider[] = [mixpanelProvider];

/**
 * Initialize analytics service
 * Should be called once at app startup
 */
export function initializeAnalytics(): void {
  try {
    initializeMixpanel();
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to initialize analytics:', error);
    }
  }
}

/**
 * Flatten and serialize properties for analytics
 * Converts complex objects to strings and ensures all values are serializable
 */
function serializeProperties(
  properties: AnalyticsProperties | undefined,
): Record<string, unknown> {
  if (!properties) {
    return {};
  }

  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined || value === null) {
      continue; // Skip undefined/null values
    }

    // Handle different value types
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      serialized[key] = value;
    } else if (typeof value === 'object') {
      // Serialize objects and arrays to JSON strings for Mixpanel
      try {
        serialized[key] = JSON.stringify(value);
      } catch (error) {
        if (__DEV__) {
          console.warn(
            `[Analytics] Failed to serialize property ${key}:`,
            error,
          );
        }
        serialized[key] = String(value);
      }
    } else {
      serialized[key] = String(value);
    }
  }

  return serialized;
}

/**
 * Get current active profile_id from store
 * This is used to automatically include profile_id in all events
 */
function getCurrentProfileId(): string | undefined {
  try {
    const currentActiveProfileId =
      useUserProfileStore.getState().currentActiveProfileId;
    return currentActiveProfileId || undefined;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to get profile_id from store:', error);
    }
    return undefined;
  }
}

/**
 * Track an analytics event
 * Similar to notifyApi pattern - fire and forget
 * Automatically includes profile_id in all events
 */
export function trackAnalytics(
  eventName: AnalyticsEventName,
  properties?: AnalyticsProperties,
): void {
  try {
    const serializedProps = serializeProperties(properties);
    const currentProfileId = getCurrentProfileId();

    const eventProperties = {
      ...serializedProps,
      // Automatically include profile_id in all events
      ...(currentProfileId && {profile_id: currentProfileId}),
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    // Send to all registered providers
    providers.forEach(provider => {
      try {
        provider.track(eventName, eventProperties);
      } catch (error) {
        if (__DEV__) {
          console.error(
            `[Analytics] Provider failed to track event ${eventName}:`,
            error,
          );
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to track analytics event:', error);
    }
  }
}

/**
 * Identify a user
 * Sets the distinct_id for the user
 */
export function identifyUser(userId: string): void {
  try {
    if (!userId) {
      if (__DEV__) {
        console.warn('[Analytics] Cannot identify user: userId is empty');
      }
      return;
    }

    providers.forEach(provider => {
      try {
        console.log('identifyUser', userId);
        provider.identify(userId);
      } catch (error) {
        if (__DEV__) {
          console.error('[Analytics] Provider failed to identify user:', error);
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }
}

/**
 * Set user properties
 * Updates user attributes in analytics
 * Note: User should be identified first using identifyUser()
 */
export function setUserProperties(properties: UserProperties): void {
  try {
    providers.forEach(provider => {
      try {
        provider.setUserProperties(properties);
      } catch (error) {
        if (__DEV__) {
          console.error(
            '[Analytics] Provider failed to set user properties:',
            error,
          );
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }
}

/**
 * Identify user and set properties in one call
 * Ensures identification happens before setting properties
 */
export function identifyUserAndSetProperties(
  userId: string,
  properties: UserProperties,
): void {
  try {
    if (!userId) {
      if (__DEV__) {
        console.warn('[Analytics] Cannot identify user: userId is empty');
      }
      return;
    }

    // First identify the user
    identifyUser(userId);
    // Then set properties (with a small delay to ensure identify completes)
    // In practice, set() can be called immediately after identify()
    setUserProperties(properties);
    if (__DEV__) {
      console.log('[Analytics] Identified user and set properties:', {
        userId,
        hasEmail: !!properties.email,
        propertyCount: Object.keys(properties).length,
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[Analytics] Failed to identify and set properties:',
        error,
      );
    }
  }
}

/**
 * Calculate age from birthdate
 * Supports DD/MM/YYYY format
 */
export function calculateAgeFromBirthdate(
  birthdate: string,
): number | undefined {
  try {
    if (!birthdate) {
      return undefined;
    }

    // Parse DD/MM/YYYY format
    const date = moment(birthdate, 'DD/MM/YYYY', true);
    if (!date.isValid()) {
      // Try other common formats
      const altDate = moment(birthdate);
      if (!altDate.isValid()) {
        return undefined;
      }
      return moment().diff(altDate, 'years');
    }

    return moment().diff(date, 'years');
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to calculate age:', error);
    }
    return undefined;
  }
}

/**
 * Prepare user properties from user attributes
 */
export function prepareUserProperties(
  userAttributes: Record<string, unknown>,
): UserProperties {
  const birthdate = userAttributes.birthdate as string | undefined;
  const age = birthdate ? calculateAgeFromBirthdate(birthdate) : undefined;

  return {
    user_id: userAttributes.user_id as string | undefined,
    profile_id: userAttributes.profile_id as string | undefined,
    email: userAttributes.email as string | undefined,
    phone_number: userAttributes.phone_number as string | undefined,
    given_name: userAttributes.given_name as string | undefined,
    family_name: userAttributes.family_name as string | undefined,
    middle_name: userAttributes.middle_name as string | undefined,
    gender: userAttributes.gender as string | undefined,
    age,
    birthdate,
    height: userAttributes.height as string | undefined,
    weight: userAttributes.weight as string | undefined,
    height_unit: userAttributes.height_unit as string | undefined,
    weight_unit: userAttributes.weight_unit as string | undefined,
    bmi: userAttributes.bmi as string | undefined,
    bmi_category: userAttributes.bmi_category as string | undefined,
    relation: userAttributes.relation as string | undefined,
    locale: userAttributes.locale as string | undefined,
  };
}

/**
 * Reset user (on logout)
 */
export function resetUser(): void {
  try {
    providers.forEach(provider => {
      try {
        provider.reset();
      } catch (error) {
        if (__DEV__) {
          console.error('[Analytics] Provider failed to reset user:', error);
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to reset user:', error);
    }
  }
}

// Export event constants for use in components
export {ANALYTICS_EVENTS};

/**
 * Mixpanel Analytics Provider
 * Handles all Mixpanel-specific analytics operations
 */

import Mixpanel from 'react-native-mixpanel';
import useUserProfileStore from '../../../../store/profileStore';
import {UserProperties} from '../types';

const MIXPANEL_TOKEN = 'e84ec9be35b114614d32c35fffac8a88';

let isInitialized = false;

/**
 * Initialize Mixpanel
 */
export function initializeMixpanel(): void {
  try {
    if (!isInitialized) {
      Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN);
      isInitialized = true;
      if (__DEV__) {
        console.log('[Analytics] Mixpanel initialized');
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to initialize Mixpanel:', error);
    }
  }
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
 * Track an event
 * Automatically includes profile_id in all events
 */
export function trackMixpanelEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  try {
    if (!isInitialized) {
      if (__DEV__) {
        console.warn(
          '[Analytics] Mixpanel not initialized, skipping event:',
          eventName,
        );
      }
      return;
    }

    // Get current profile_id and add it to properties
    const currentProfileId = getCurrentProfileId();
    const eventProperties = {
      ...(properties || {}),
      // Automatically include profile_id in all events
      ...(currentProfileId && {profile_id: currentProfileId}),
    };

    // Use trackWithProperties if properties exist, otherwise use track
    if (Object.keys(eventProperties).length > 0) {
      Mixpanel.trackWithProperties(eventName, eventProperties);
    } else {
      Mixpanel.track(eventName);
    }
    if (__DEV__) {
      console.log('[Analytics] Tracked event:', eventName, eventProperties);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to track event:', eventName, error);
    }
  }
}

/**
 * Identify a user
 * In Mixpanel, identify() sets the distinct_id for the user
 * All subsequent events will be associated with this user ID
 */
export function identifyMixpanelUser(userId: string): void {
  try {
    if (!isInitialized) {
      if (__DEV__) {
        console.warn('[Analytics] Mixpanel not initialized, skipping identify');
      }
      return;
    }

    if (!userId) {
      if (__DEV__) {
        console.warn('[Analytics] Cannot identify user: userId is empty');
      }
      return;
    }

    // Identify the user - this sets the distinct_id in Mixpanel
    // All future events will be associated with this user ID
    // Note: identify() is synchronous in the API but may queue internally
    Mixpanel.identify(userId);
    // Flush to ensure identify is processed immediately
    // This helps ensure subsequent events use the new distinct_id
    Mixpanel.flush();
    if (__DEV__) {
      console.log('[Analytics] ✅ Identified user with distinct_id:', userId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }
}

/**
 * Set user properties
 * In Mixpanel, after identify(), set() updates user profile properties
 */
export function setMixpanelUserProperties(properties: UserProperties): void {
  try {
    if (!isInitialized) {
      if (__DEV__) {
        console.warn(
          '[Analytics] Mixpanel not initialized, skipping set properties',
        );
      }
      return;
    }

    // Filter out undefined values and convert to proper types
    // Mixpanel People properties use special $ prefixes for certain properties
    const cleanProperties: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined && value !== null) {
        // Map special properties to Mixpanel's People property format
        let propertyKey = key;
        if (key === 'email') {
          propertyKey = '$email'; // Mixpanel special property for email
        } else if (key === 'phone_number') {
          propertyKey = '$phone'; // Mixpanel special property for phone
        } else if (key === 'given_name') {
          propertyKey = '$first_name'; // Mixpanel special property for first name
        } else if (key === 'family_name') {
          propertyKey = '$last_name'; // Mixpanel special property for last name
        } else if (key === 'user_id' || key === 'profile_id') {
          // Keep user_id and profile_id as custom properties
          propertyKey = key;
        }

        if (typeof value === 'string' || typeof value === 'number') {
          cleanProperties[propertyKey] = value;
        } else if (typeof value === 'boolean') {
          cleanProperties[propertyKey] = value ? 1 : 0;
        } else {
          // Convert other types to string
          cleanProperties[propertyKey] = String(value);
        }
      }
    }

    // Always include name if we have first_name and last_name
    if (cleanProperties.$first_name && cleanProperties.$last_name) {
      cleanProperties.$name = `${cleanProperties.$first_name} ${cleanProperties.$last_name}`;
    }

    if (Object.keys(cleanProperties).length === 0) {
      if (__DEV__) {
        console.warn('[Analytics] No valid properties to set');
      }
      return;
    }

    // Use set() for People properties
    // After identify(), set() creates/updates the user profile in Mixpanel People
    // This makes properties visible in the Users tab
    // Note: set() in react-native-mixpanel sets People properties, not super properties
    Mixpanel.set(cleanProperties);
    if (__DEV__) {
      console.log('[Analytics] Set People properties:', {
        propertyCount: Object.keys(cleanProperties).length,
        hasEmail: !!cleanProperties.$email,
        hasPhone: !!cleanProperties.$phone,
        hasFirstName: !!cleanProperties.$first_name,
        hasLastName: !!cleanProperties.$last_name,
        hasName: !!cleanProperties.$name,
        hasUserId: !!cleanProperties.user_id,
        hasProfileId: !!cleanProperties.profile_id,
        properties: cleanProperties,
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }
}

/**
 * Reset user (on logout)
 */
export function resetMixpanelUser(): void {
  try {
    if (!isInitialized) {
      return;
    }

    Mixpanel.reset();
    if (__DEV__) {
      console.log('[Analytics] Reset Mixpanel user');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Analytics] Failed to reset user:', error);
    }
  }
}

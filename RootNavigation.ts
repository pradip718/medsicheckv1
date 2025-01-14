// RootNavigation.js

import {createNavigationContainerRef} from '@react-navigation/native';
import {MainStackParamList} from './types/navigation';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// add other navigation functions that you need and export them

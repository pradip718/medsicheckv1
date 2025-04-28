import {Mutex} from 'async-mutex'; // Assuming you're using the `async-mutex` library
import axios, {AxiosResponse} from 'axios';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import {navigationRef} from '../../RootNavigation';
import useLanguageStore from '../../store/languageStore';
import {getDeviceLocaleInformation} from '../../utils/methods';
import {errorToast} from '../../utils/toast';
import {refreshToken, signout} from './auth';

const NO_AUTH_CHECK_URLS = [
  '/account/api/v1/login/',
  'v1/language',
  'v1/sign-up',
  'v1/login',
  'v1/app_config',
  'v1/click_event',
];

const axiosInstance = axios.create({
  baseURL: Config.BASE_URL,
});

function getPathBeforeQuery(url: string) {
  return url.split('?')[0];
}

let refreshing_token: Promise<AxiosResponse<Record<string, string>>> | null =
  null;

axiosInstance.interceptors.request.use(
  async config => {
    if (
      config.url &&
      !NO_AUTH_CHECK_URLS.includes(getPathBeforeQuery(config.url))
    ) {
      config.withCredentials = true;
    }

    const deviceId = await DeviceInfo.getUniqueId();
    const locale = getDeviceLocaleInformation();
    config.params = {
      ...config.params,
      app_version: DeviceInfo.getVersion(),
      device_id: deviceId,
      os: Platform.OS,
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      systemVersion: DeviceInfo.getSystemVersion(),
      locale,
    };

    return config;
  },
  error => Promise.reject(error),
);

const signoutMutex = new Mutex(); // Create a mutex instance for signout

async function handleSignout(skipSignout = false) {
  const languages = useLanguageStore.getState().languages;
  try {
    if (!skipSignout) {
      await signout(); // Only attempt signout if we have a valid token
    }
  } catch {
    // Ensure navigation to login even if signout fails
  } finally {
    navigationRef.navigate('Login');
    errorToast(languages.refresh_token_expiry);
  }
}

async function ensureTokenRefresh() {
  if (!refreshing_token) {
    refreshing_token = refreshToken();
    await refreshing_token;
    refreshing_token = null;
  } else {
    await refreshing_token; // Wait for the ongoing refresh
  }
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const statusCode = error.response?.data?.statusCode;

    console.log('statusCode', statusCode);

    if (statusCode === 401 && !originalRequest._retry) {
      console.log('Refreshing Token');
      originalRequest._retry = true;
      try {
        await ensureTokenRefresh();
        return axios(originalRequest); // Retry request with refreshed token
      } catch (refreshError) {
        if (!originalRequest._signoutAttempted) {
          originalRequest._signoutAttempted = true;
          await handleSignout(true); // Skip signout as token is invalid
        }
        return Promise.reject(refreshError);
      }
    }

    if (statusCode === 403 && !originalRequest._signoutAttempted) {
      const release = await signoutMutex.acquire();
      try {
        if (!originalRequest._signoutAttempted) {
          originalRequest._signoutAttempted = true;
          await handleSignout(false); // Attempt signout normally
        }
      } finally {
        release();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

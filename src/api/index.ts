import {Mutex} from 'async-mutex'; // Assuming you're using the `async-mutex` library
import axios from 'axios';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';
import {navigationRef} from '../../RootNavigation';
import useLanguageStore from '../../store/languageStore';
import {encryptText, getDeviceLocaleInformation} from '../../utils/methods';
import {errorToast} from '../../utils/toast';
import {REMEMBERED_USER_SESSION} from '../constants/AsyncStorageKeys';
import {login, signout} from './auth';

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
      version: 'v1',
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
const refreshTokenMutex = new Mutex();
let refreshPromise: Promise<boolean> | null = null;

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

async function ensureTokenRefresh(): Promise<boolean> {
  const release = await refreshTokenMutex.acquire();

  try {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const session = await EncryptedStorage.getItem(REMEMBERED_USER_SESSION);
        if (session) {
          const userSession = JSON.parse(session);
          const encryptPassword = await encryptText(userSession?.password);
          if (!encryptPassword) throw new Error('Encryption failed');

          await login({
            username: userSession.username,
            password: encryptPassword,
          });

          return true;
        } else {
          await handleSignout(true);
          return false;
        }
      } catch (err) {
        console.log('err', err);
        await handleSignout(true);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  } finally {
    release();
  }
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const statusCode = error.response?.data?.statusCode;

    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshSuccess = await ensureTokenRefresh();

      if (refreshSuccess) {
        return axios(originalRequest);
      }

      return Promise.reject(error);
    }

    if (statusCode === 403 && !originalRequest._signoutAttempted) {
      const release = await signoutMutex.acquire();
      try {
        if (!originalRequest._signoutAttempted) {
          originalRequest._signoutAttempted = true;
          await handleSignout(false);
        }
      } finally {
        release();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

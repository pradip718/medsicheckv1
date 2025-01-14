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

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const statusCode = error.response?.data?.statusCode;

    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        refreshing_token = refreshing_token ? refreshing_token : refreshToken();
        await refreshing_token;
        refreshing_token = null;
        return axios(originalRequest);
      } catch (refreshError) {
        if (!originalRequest._signoutAttempted) {
          originalRequest._signoutAttempted = true;
          try {
            const languages = useLanguageStore.getState().languages;
            await signout();
            navigationRef.navigate('Login');
            errorToast(languages.refresh_token_expiry);
          } finally {
            return Promise.reject(refreshError);
          }
        }
      }
    } else if (statusCode === 403 && !originalRequest._signoutAttempted) {
      originalRequest._signoutAttempted = true;
      const languages = useLanguageStore.getState().languages;
      await signout();
      navigationRef.navigate('Login');
      errorToast(languages.refresh_token_expiry);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

import axios from 'axios';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

const axiosSessionInstance = axios.create({
  baseURL: Config.BASE_URL,
});
const NO_AUTH_CHECK_URLS = ['v1/verify-session', 'v1/language'];

function getPathBeforeQuery(url: string) {
  return url.split('?')[0];
}

axiosSessionInstance.interceptors.request.use(
  async config => {
    if (
      config.url &&
      !NO_AUTH_CHECK_URLS.includes(getPathBeforeQuery(config.url))
    ) {
      // config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = await DeviceInfo.getUniqueId();

    config.params = {
      ...config.params,
      app_version: DeviceInfo.getVersion(),
      device_id: deviceId,
      os: Platform.OS,
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      systemVersion: DeviceInfo.getSystemVersion(),
    };
    return config;
  },
  error => Promise.reject(error),
);

export default axiosSessionInstance;

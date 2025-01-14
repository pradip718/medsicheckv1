import axiosInstance from '..';
import useAuthStore from '../../../store/authStore';
import axiosSessionInstance from '../sessionConfiguration';

async function getLanguage(locale: string) {
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/language?locale=${locale}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function updateLocale(locale: string) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/user-locale',
      data: {locale: locale},
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export {getLanguage, updateLocale};

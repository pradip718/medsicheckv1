import useUserProfileStore from '../../../store/profileStore';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import axiosSessionInstance from '../sessionConfiguration';

export async function getSessionRescanConfigurations() {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  try {
    const response = await axiosSessionInstance({
      method: 'GET',
      url: `v1/rescan?profile_id=${profile_id}&locale=${locale}&client_name=medsi_check`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function getSessionReportReading(
  page?: number,
  reading_id?: string,
) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  try {
    const response = await axiosSessionInstance({
      method: 'GET',
      url: `v1/health-reportsdasd?locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }${reading_id ? '&reading_id=' + reading_id : ''}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

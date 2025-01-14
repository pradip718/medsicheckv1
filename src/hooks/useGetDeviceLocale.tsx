import {useEffect, useState} from 'react';
import {getDeviceLocaleInformation} from '../../utils/methods';

const useGetDeviceLocale = () => {
  const [isEnglish, setIsEnglish] = useState(true);
  const language = getDeviceLocaleInformation();

  useEffect(() => {
    if (language?.includes('en')) {
      setIsEnglish(true);
    } else {
      setIsEnglish(false);
    }
  }, [language]);

  return {isEnglish};
};

export default useGetDeviceLocale;

import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';

const useScreenOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  const getOrientation = () => {
    const {width, height} = Dimensions.get('window');
    setIsLandscape(width < height ? false : true);
  };

  useEffect(() => {
    getOrientation(); // Set initial orientation
    const subscription = Dimensions.addEventListener('change', getOrientation); // Add listener for orientation change
    return () => subscription?.remove();
  }, []);
  return {isLandscape};
};

export default useScreenOrientation;

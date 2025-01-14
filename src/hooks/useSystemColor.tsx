import {useColorScheme} from 'nativewind';
import {useEffect, useState} from 'react';
import {Appearance} from 'react-native';

const useSystemColor = () => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<string>(colorScheme?.colorScheme);

  useEffect(() => {
    Appearance.addChangeListener(appearance => {
      if (appearance.colorScheme) {
        setTheme(appearance.colorScheme);
      }
    });
  }, []);

  return {isDark: theme === 'dark'};
};

export default useSystemColor;

import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {PreventixLogo} from '../../../../assets';
// import useLanguageStore from '../../../../store/languageStore';
// import CustomText from '../../../components/Text';

const Header = () => {
  // const {languages} = useLanguageStore();

  return (
    <View
      className="h-[195px] justify-center items-center w-full mt-10"
      style={styles.headerContainer}>
      <Image source={PreventixLogo as any} style={styles.logo} />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  logo: {
    height: 158,
    aspectRatio: '65/79',
    resizeMode: 'contain',
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 17.8,
    elevation: 2,

    // borderWidth: 0.1,
    // borderColor: 'rgba(63, 101, 255, 0.41)',
  },
});

import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MedsiCheckLogo2} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';

const Header = () => {
  const {languages} = useLanguageStore();

  return (
    <LinearGradient
      colors={[
        'rgba(63, 101, 255, 0.41)',
        'rgba(202, 213, 255, 0.38)',
        'rgba(63, 101, 255, 0.41)',
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      useAngle
      angle={38.96}
      angleCenter={{x: 1, y: 0}}
      locations={[0.0127, 0.5765, 0.9539]}
      className="mt-4 flex-row items-center w-full"
      style={styles.headerContainer}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.04)']}
        className="flex-row items-center w-full justify-between pr-10"
        useAngle
        angle={147.49}
        angleCenter={{x: 1, y: 0}}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        locations={[0.0659, 0.923]}>
        <Image source={MedsiCheckLogo2 as any} style={styles.logo} />
        <View className="flex-1 items-end">
          <View>
            <CustomText className="text-xl text-white font-isidoraSemiBold">
              {languages?.header_msg}
            </CustomText>
            <CustomText className="text-sm text-white font-isidoraMedium">
              {languages?.sub_header}
            </CustomText>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
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
      height: 0,
    },
    shadowOpacity: 0.23,
    shadowRadius: 17.8,
    elevation: 2,

    borderWidth: 1,
    borderColor: 'rgba(63, 101, 255, 0.41)',
  },
});

import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import {isAndroid} from '../../../utils';
import {shouldGoToFaceScan} from '../../../utils/navigation';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import customColor from '../../theme/customColor';
import ToolTipWalkthrough from '../CustomCopilot/ToolTipWalkthrough';
import Icon from '../Icon';
import ScanButton from '../ScanButton';
import VoiceScanButton from '../ScanButton/VoiceScan';
import CustomText from '../Text';

interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar = ({
  state: {index: activeIndex, routes},
  // descriptors,
  navigation,
}: CustomTabBarProps) => {
  const {languages} = useLanguageStore();

  const {startScan} = usePrepareFacescan();

  const handleScanButtonPress = async () => {
    const shouldGoToFacescan = await shouldGoToFaceScan();
    if (shouldGoToFacescan) {
      startScan();
    } else {
      navigation.navigate('FaceScan');
    }
  };

  const handleVoiceScanButtonPress = async () => {
    navigation.navigate('VoiceScanIntroScreen');
  };

  return (
    <View style={[styles.tabBar]}>
      <ImageBackground
        source={require('../../../assets/images/tabbar.png')}
        className="relative"
        style={styles.backgroundImage}>
        {routes.map((route, index: number) => {
          const isFocused = index === activeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          if (route.name === 'Scan') {
            return (
              <View
                key={`${route.name}-${index}`}
                className="w-[18%] items-center">
                <View
                  style={styles.scanContainer}
                  className="w-[100%] items-center"
                  key={`${route.name}-${index}`}>
                  <ToolTipWalkthrough
                    walkthroughName="scan_button"
                    placement="top">
                    <ScanButton onPressScanButton={handleScanButtonPress} />
                  </ToolTipWalkthrough>
                </View>
                <CustomText
                  className={twMerge(
                    'font-isidoraMedium',
                    !isAndroid && '-mt-2',
                  )}>
                  {languages?.faceScan}
                </CustomText>
              </View>
            );
          }

          if (route.name === 'VoiceScan') {
            return (
              <View
                key={`${route.name}-${index}`}
                className="w-[19%] items-center ml-[6%]">
                <View
                  style={styles.voiceScanContainer}
                  className="w-full items-center"
                  key={`${route.name}-${index}`}>
                  <ToolTipWalkthrough
                    walkthroughName="scan_button"
                    placement="top">
                    <VoiceScanButton
                      onPressVoiceScanButton={handleVoiceScanButtonPress}
                    />
                  </ToolTipWalkthrough>
                </View>
                <CustomText
                  className={twMerge(
                    'font-isidoraMedium',
                    !isAndroid && '-mt-2',
                  )}>
                  {languages?.voice_scan}
                </CustomText>
              </View>
            );
          }

          if (route.name === 'Homepage') {
            return (
              <TouchableOpacity
                key={`${route.name}-${index}`}
                className="h-[80px] pt-2 w-[29.5%] items-center"
                onPress={onPress}
                onLongPress={onLongPress}>
                <View
                  className={twMerge(
                    'p-2 items-center space-y-1',
                    isFocused &&
                      'bg-white rounded-xl p-2 items-center space-y-1',
                  )}>
                  <Icon
                    name="Home"
                    size={24}
                    color={
                      isFocused ? customColor.blueBerry : customColor.extraGrey
                    }
                  />
                  <CustomText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`w-[50] text-center ${
                      isFocused ? 'font-isidoraBold' : ''
                    }`}>
                    {languages?.home}
                  </CustomText>
                </View>
              </TouchableOpacity>
            );
          }
          if (route.name === 'Profile') {
            return (
              <TouchableOpacity
                key={`${route.name}-${index}`}
                className="h-[80px] pt-2 w-[29.5%] items-center"
                onPress={onPress}
                onLongPress={onLongPress}>
                <View
                  className={`p-2 items-center space-y-1 ${
                    isFocused ? 'bg-white rounded-xl ' : ''
                  }`}>
                  <Icon
                    name="profile"
                    size={20}
                    color={
                      isFocused ? customColor.blueBerry : customColor.extraGrey
                    }
                  />
                  <CustomText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`w-[50] text-center ${
                      isFocused ? 'font-isidoraBold' : ''
                    }`}>
                    {languages?.profile}
                  </CustomText>
                </View>
              </TouchableOpacity>
            );
          }
        })}
      </ImageBackground>
    </View>
  );
};

export default CustomTabBar;

export const styles = StyleSheet.create({
  tabBar: {
    // backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
  },
  scanContainer: {
    transform: [
      // {
      //   translateX: 6,
      // },
      {
        translateY: -8,
      },
    ],
  },
  voiceScanContainer: {
    transform: [
      // {
      //   translateX: 6,
      // },
      {
        translateY: -8,
      },
    ],
  },
  backgroundImage: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    height: 88,
    width: '100%',
  },
});

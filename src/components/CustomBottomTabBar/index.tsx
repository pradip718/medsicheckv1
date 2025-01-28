import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import customColor from '../../theme/customColor';
import ToolTipWalkthrough from '../CustomCopilot/ToolTipWalkthrough';
import Icon from '../Icon';
import ScanButton from '../ScanButton';
import CustomText from '../Text';

interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar = ({
  state: {index: activeIndex, routes},
  // descriptors,
  navigation,
}: CustomTabBarProps) => {
  const {languages} = useLanguageStore();

  const {startScan} = usePrepareFacescan();

  return (
    <View style={[styles.tabBar]}>
      <View style={styles.tabBarContainer}>
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

            // const {options} = descriptors[route.key];
            if (route.name === 'Scan') {
              return (
                <View key={`${route.name}-${index}`}>
                  <View
                    style={styles.scanContainer}
                    className="absolute left-[50%]  bg-green-400"
                    key={`${route.name}-${index}`}>
                    <ToolTipWalkthrough
                      walkthroughName="scan_button"
                      placement="top">
                      <ScanButton onPressScanButton={startScan} />
                    </ToolTipWalkthrough>
                  </View>
                  <CustomText className="absolute bottom-3 -left-7 w-[150] font-isidoraMedium">
                    {languages?.faceScan}
                  </CustomText>
                </View>
              );
            }

            if (route.name === 'Homepage') {
              return (
                <TouchableOpacity
                  key={`${route.name}-${index}`}
                  className="h-[80px] pt-4"
                  onPress={onPress}
                  onLongPress={onLongPress}>
                  <View
                    className={
                      isFocused
                        ? 'bg-white rounded-xl p-2 items-center space-y-1'
                        : 'p-2 items-center space-y-1'
                    }>
                    <Icon
                      name="Home"
                      size={24}
                      color={
                        isFocused
                          ? customColor.blueBerry
                          : customColor.extraGrey
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
                  className="h-[80px] pt-4"
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
                        isFocused
                          ? customColor.blueBerry
                          : customColor.extraGrey
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
    </View>
  );
};

export default CustomTabBar;

export const styles = StyleSheet.create({
  tabBar: {
    // backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  scanContainer: {
    backgroundColor: 'transparent',
    // marginRight: 2,
    transform: [
      {
        translateX: -30,
      },
      {
        translateY: -8,
      },
    ],
  },
  backgroundImage: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 88,
    width: '100%',
  },
});

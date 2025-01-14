import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import Icon from '../Icon';
import CustomText from '../Text';

interface CustomTabBarProps extends BottomTabBarProps {}

const UnverifiedCustomTabBar = ({
  state: {index: activeIndex, routes},
  // descriptors,
  navigation,
}: CustomTabBarProps) => {
  const {languages} = useLanguageStore();

  return (
    <View className="relative space-x-16" style={styles.backgroundImage}>
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

        if (route.name === 'UnverifiedHome') {
          return (
            <TouchableOpacity
              key={`${route.name}-${index}`}
              className="h-[80px] pt-4 flex-1 items-end"
              onPress={onPress}
              onLongPress={onLongPress}>
              <View
                className={`h-14 w-16 justify-center items-center space-y-1  ${
                  isFocused ? 'bg-white rounded-xl' : ''
                }`}>
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
        if (route.name === 'UnverifiedProfile') {
          return (
            <TouchableOpacity
              key={`${route.name}-${index}`}
              className="h-[80px] flex-1 pt-4"
              onPress={onPress}
              onLongPress={onLongPress}>
              <View
                className={`h-14 w-16 justify-center items-center space-y-1 ${
                  isFocused ? 'bg-white rounded-xl' : ''
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
    </View>
  );
};

export default UnverifiedCustomTabBar;

export const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: customColor.azureishWhite,
    position: 'absolute',
    bottom: 0,
    elevation: 4,
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
    backgroundColor: customColor.azureishWhite,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    height: 88,
    width: '100%',
  },
});

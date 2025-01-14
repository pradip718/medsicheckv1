import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {PreventixNavLogo} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import {color} from '../../../theme';
import customColor from '../../../theme/customColor';

type NavbarProps = {
  hasProfile?: boolean;
  hasClose?: boolean;
  handleClose?: () => void;
  hasSave?: boolean;
  noBack?: boolean;
  handleSave?: () => void;
  handleBack?: () => void;
};

const Navbar = (props: NavbarProps) => {
  const {
    // hasProfile,
    hasClose,
    hasSave,
    handleSave,
    noBack = false,
    handleClose,
    handleBack,
  } = props;
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderLeftItem = () => {
    return !noBack ? (
      <TouchableOpacity
        onPress={handleBack ? handleBack : handleBackPress}
        className="p-2">
        <Icon name="back" size={20} color={color.primary} />
      </TouchableOpacity>
    ) : (
      <View className="p-2" />
    );
  };

  const renderRightItem = () => {
    switch (true) {
      case hasClose:
        return (
          <TouchableOpacity
            className="items-end"
            onPress={() => {
              if (handleClose) {
                handleClose();
              } else {
                navigation.navigate('HomepageStackScreens', {
                  screen: 'Home',
                });
              }
            }}>
            <Icon name="close" size={24} color={customColor.primary} />
          </TouchableOpacity>
        );
      case hasSave:
        return (
          <TouchableOpacity onPress={handleSave} className="items-end">
            <CustomText className=" text-ultramarineBlue font-isidoraSemiBold text-base">
              {languages?.save || ''}
            </CustomText>
          </TouchableOpacity>
        );
      default:
        return <View className="p-2" />;
    }
  };

  return (
    <View
      className="flex-row justify-between items-center min-h-[72px] px-4"
      style={styles.container}>
      <View className="z-10">{renderLeftItem()}</View>
      <View className="flex-grow items-center absolute m-auto left-0 top-0 right-0 z-0 justify-center">
        <Image
          source={PreventixNavLogo as any}
          className="w-full"
          resizeMode="contain"
        />
      </View>
      <View className="z-10">{renderRightItem()}</View>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  container: {},
});

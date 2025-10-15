import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface EclipseBackgroundProps {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundImageStyle?: StyleProp<ViewStyle>;
  imageSource?: ImageSourcePropType;
}

const EclipseBackground = ({
  children,
  containerStyle,
  backgroundImageStyle,
  imageSource,
}: EclipseBackgroundProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ImageBackground
        source={
          imageSource ||
          require('../../assets/images/eclipse_background_blue.png')
        }
        style={[styles.backgroundImage, backgroundImageStyle]}>
        {children}
      </ImageBackground>
    </View>
  );
};

export default EclipseBackground;

const styles = StyleSheet.create({
  container: {
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {},
});

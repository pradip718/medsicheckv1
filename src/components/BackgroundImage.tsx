import React, {PropsWithChildren} from 'react';
import {ImageBackground, ImageBackgroundProps, StyleSheet} from 'react-native';

const BackgroundImage = ({
  children,
  ...restProps
}: PropsWithChildren<Omit<ImageBackgroundProps, 'source'>>) => {
  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="stretch"
      {...restProps}>
      {children}
    </ImageBackground>
  );
};

export default BackgroundImage;

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
});

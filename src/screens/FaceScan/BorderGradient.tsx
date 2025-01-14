import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';

interface BorderGradientProps extends LinearGradientProps {
  innerContainerStyle?: ViewStyle;
}

const BorderGradient = ({
  children,
  colors,
  innerContainerStyle,
  ...restProps
}: BorderGradientProps) => {
  return (
    <>
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.linearGradient}
        {...restProps}>
        <View style={[styles.innerContainer, innerContainerStyle]}>
          {children}
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    // height: 150,
    // width: '100%',
  },
  innerContainer: {
    width: '100%',
    flex: 1,
    margin: 2, // <-- Border Width
    // backgroundColor: 'transparent',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
});

export default BorderGradient;

import {MotiProps, MotiTransitionProp, View} from 'moti';
import React from 'react';
import {ViewProps} from 'react-native';

interface AnimtedWrapperProps extends MotiProps, ViewProps {
  isTranslateY?: boolean;
  shouldScaleFrom0?: boolean;
  duration?: number;
}

const AnimatedWrapper = ({
  children,
  isTranslateY = true,
  shouldScaleFrom0 = false,
  duration = 800,
  ...restProps
}: AnimtedWrapperProps) => {
  const animationProps: MotiProps = {
    from: {
      translateY: isTranslateY ? 200 : 0,
      opacity: 0,

      scale: shouldScaleFrom0 ? 0 : 1,
    },
    animate: {translateY: 0, opacity: 1, scale: 1},
    exit: {
      translateY: isTranslateY ? 200 : 0,
      opacity: 0,
      scale: shouldScaleFrom0 ? 0 : 1,
    },
    transition: {
      type: 'timing',
      duration,
    } as MotiTransitionProp<any>,
  };

  return (
    <View {...animationProps} {...restProps}>
      {children}
    </View>
  );
};

export default AnimatedWrapper;

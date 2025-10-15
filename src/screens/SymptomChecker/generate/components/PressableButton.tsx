import React, {ComponentProps, useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import {SEMIBOLD} from '../../../../constants/Fonts';
import {color} from '../../../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableButtonProps = {
  isSelected: boolean;
  text: string;
} & ComponentProps<typeof Pressable>;

const PressableButton = ({
  isSelected,
  text,
  ...props
}: PressableButtonProps) => {
  const scale = useSharedValue(1);
  const selectedValue = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectedValue.value = withTiming(isSelected ? 1 : 0, {duration: 250});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selectedValue.value,
      [0, 1],
      ['#F3F4F6', color.ultramarineBlue],
    );

    return {
      transform: [{scale: withSpring(scale.value)}],
      backgroundColor,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      selectedValue.value,
      [0, 1],
      ['#222A3D', '#FFFFFF'],
    );

    return {color};
  });

  const onPressIn = () => {
    scale.value = withTiming(0.9, {duration: 250});
  };

  const onPressOut = () => {
    scale.value = withTiming(1, {duration: 250});
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.button, animatedStyles]}
      {...props}>
      <Animated.Text style={[styles.text, animatedTextStyle]}>
        {text}
      </Animated.Text>
    </AnimatedPressable>
  );
};

export default PressableButton;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  text: {
    fontSize: 14,
    fontFamily: SEMIBOLD,
    lineHeight: 20,
  },
});

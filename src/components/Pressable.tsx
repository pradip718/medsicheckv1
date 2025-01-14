import {MotiPressable, MotiPressableProps} from 'moti/interactions';
import {styled} from 'nativewind';
import React from 'react';

interface CustomPressableProps extends MotiPressableProps {
  shouldScaleOnClick?: boolean;
}

const Pressable = (props: CustomPressableProps) => {
  const {shouldScaleOnClick = true, ...restProps} = props;
  return (
    <MotiPressable
      hitSlop={{top: 10, left: 10, right: 10, bottom: 10}}
      animate={({pressed}) => {
        'worklet';
        return {
          scale: shouldScaleOnClick ? (pressed ? 0.9 : 1) : 1,
          opacity: pressed ? 0.6 : 1,
        };
      }}
      {...restProps}
    />
  );
};

export default styled(Pressable);

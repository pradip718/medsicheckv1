import React, {PropsWithChildren} from 'react';
import {Text, TextProps} from 'react-native';
import {twMerge} from 'tailwind-merge';

interface CustomTextProps extends TextProps {
  tx?: any;
  text?: string;
  style?: any;
  rest?: any;
}

const CustomText = (props: PropsWithChildren<CustomTextProps>) => {
  const {text, children, style: styleOverride, className, ...rest} = props;

  // figure out which content to use
  const content = text || children;
  const styles = [styleOverride];
  const defaultClassName = 'font-isidoraRegular text-yankeesBlue';

  return (
    <Text
      {...rest}
      style={styles}
      className={twMerge(defaultClassName, 'text-black', className)}>
      {content}
    </Text>
  );
};

export default CustomText;

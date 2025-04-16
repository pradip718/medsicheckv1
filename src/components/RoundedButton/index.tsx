import * as React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {color, units} from '../../theme';
import {default as CustomText} from '../Text';
import {textPresets, viewPresets} from './button.presets';

interface RoundedButtonProps extends TouchableOpacityProps {
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string;

  /**
   * The i18n lookup key.
   */
  tx?: string;

  /**
   * An optional style override useful for padding & margin.
   */
  style?: ViewStyle;

  /**
   * An optional style override useful for the button text.
   */
  textStyle?: any;

  /**
   * One of the different types of text presets.
   */
  preset?: 'primary' | 'secondary' | 'disabled' | 'reset' | 'resetWhite';

  /**
   * One of the different types of text presets.
   */
  resetStyle?: boolean;

  /**
   * If true, disable all interactions for this component.
   */
  disabled?: boolean;

  /**
   * If true, show a loading spinner.
   */
  loading?: boolean;

  className?: string;
  hasDisabledStyle?: boolean;
}

const RoundedButton = (props: React.PropsWithChildren<RoundedButtonProps>) => {
  // grab the props
  const {
    preset = 'primary',
    tx,
    text,
    style: styleOverride,
    textStyle: textStyleOverride,
    children,
    disabled = false,
    loading = false,
    resetStyle,
    hasDisabledStyle = true,
    className,
    ...rest
  } = props;

  let viewStyle = viewPresets[preset] || viewPresets.primary;
  if (resetStyle) {
    viewStyle = {
      borderRadius: units.scale(100),
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };
  }
  const viewStyles = [viewStyle, styleOverride];
  const textStyle = textPresets[preset] || textPresets.primary;
  const textStyles = [textStyle, textStyleOverride];

  if (disabled && hasDisabledStyle) {
    viewStyles.push({backgroundColor: color.lightGrey});
  }

  const content = children || (
    <CustomText tx={tx} text={text} style={textStyles} />
  );

  return (
    <TouchableOpacity
      style={[viewStyles]}
      disabled={disabled}
      className={className}
      {...rest}>
      {loading && (
        <ActivityIndicator
          size={14}
          color={color.white}
          style={styles.loaderStyle}
        />
      )}
      {content}
    </TouchableOpacity>
  );
};

export default RoundedButton;

const styles = StyleSheet.create({
  loaderStyle: {
    marginHorizontal: 4,
  },
});

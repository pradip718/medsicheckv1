import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {MEDIUM} from '../../constants/Fonts';
import {color} from '../../theme';
import Icon from '../Icon';
import TextInput from '../RNElementsTextInput';

const CustomTextInput = (props: any) => {
  const {
    label,
    // labelStyle,
    style: styleOverride,
    // inputStyle,
    value,
    onBlur,
    leftIconName,
    leftIconSize,
    onRightIconPress,
    rightIconName,
    rightIconSize,
    forwardRef,
    handleFocus,
    error = undefined,
    ...rest
  } = props;
  const [focus, setIsFocus] = useState(false);
  // const inputRef = React.createRef();
  let focusInputBackground = {};

  if (focus) {
    focusInputBackground = {
      borderBottomWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.45)',
      // backgroundColor: '#EEF4FF',
    };
  }

  return (
    <TextInput
      forwardRef={forwardRef}
      returnKeyType="next"
      value={value}
      style={[styles.input, focusInputBackground, styleOverride]}
      inputStyle={styles.inputStyle}
      labelStyle={{
        ...styles.labelStyle,
        color: focus ? color.blueEyes : color.lightGrey,
      }}
      placeholderStyle={styles.placeholderStyle}
      textErrorStyle={styles.textErrorStyle}
      label={label}
      textError={error}
      renderRightIcon={() =>
        rightIconName && (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={onRightIconPress}>
            {rightIconName && (
              <Icon
                name={rightIconName}
                size={rightIconSize || 16}
                color={focus ? color.blueEyes : value ? '#000' : '#000'}
              />
            )}
          </TouchableOpacity>
        )
      }
      renderLeftIcon={() =>
        leftIconName && (
          <View style={styles.leftIconWrapper}>
            <Icon
              name={leftIconName}
              size={leftIconSize || 16}
              color={focus ? color.blueEyes : value ? '#000' : '#9E9E9E'}
            />
          </View>
        )
      }
      onFocus={() => {
        if (handleFocus) {
          handleFocus();
        }
        setIsFocus(true);
      }}
      onBlur={(e: any) => {
        setIsFocus(false);
        return onBlur(e);
      }}
      {...rest}
    />
  );
};
CustomTextInput.defaultProps = {
  onBlur: () => {},
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 0.5,
  },
  inputStyle: {
    fontSize: 14,
    minHeight: 24,
    color: color.white,
    fontFamily: MEDIUM,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: MEDIUM,
  },
  placeholderStyle: {
    fontSize: 14,
    color: color.white,
  },
  leftIconWrapper: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rightIconWrapper: {
    height: '100%',
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textErrorStyle: {
    fontSize: 16,
  },
});

import React, {useState} from 'react';
import {ControllerRenderProps} from 'react-hook-form';
import {StyleSheet} from 'react-native';
import PhoneInput, {PhoneInputProps} from 'react-native-phone-number-input';
import useLanguageStore from '../../../store/languageStore';
import {parsePhoneNumber} from '../../../utils/methods';
import {SEMIBOLD} from '../../constants/Fonts';

interface CustomPhoneInputProps<TFieldValues extends Record<string, any>>
  extends PhoneInputProps {
  value: ControllerRenderProps<TFieldValues, any>['value'];
  onChange: ControllerRenderProps<TFieldValues, any>['onChange'];
  onBlur: ControllerRenderProps<TFieldValues, any>['onBlur'];
}

const CustomPhoneInput = <TFieldValues extends Record<string, any>>({
  value,
  onChange,
  onBlur,
  ...restProps
}: CustomPhoneInputProps<TFieldValues>) => {
  // const phoneInput = useRef<PhoneInput>(null);
  const {languages} = useLanguageStore();
  const [isFocused, setIsFocused] = useState(false);

  const onFocusChange = (focus: boolean) => {
    setIsFocused(focus);
  };

  return (
    <PhoneInput
      // defaultValue={value}
      defaultCode={parsePhoneNumber(value)?.regionCode || 'MX'}
      layout="first"
      // onChangeText={text => {
      //   console.log('text', text);
      //   // setValue(text);
      // }}
      value={parsePhoneNumber(value)?.nationalNumber ?? value}
      placeholder={languages?.phone}
      onChangeFormattedText={onChange}
      containerStyle={styles(isFocused).container}
      textInputStyle={styles(isFocused).textInput}
      codeTextStyle={styles(isFocused).codeTextStyle}
      textContainerStyle={styles(isFocused).textContainerStyle}
      flagButtonStyle={styles(isFocused).flagButtonStyle}
      textInputProps={{
        placeholderTextColor: 'rgba(255, 255, 255, 0.5)',
        onBlur: () => {
          onBlur();
          onFocusChange(false);
        },
        onFocus: () => {
          onFocusChange(true);
        },
      }}
      // autoFocus
      {...restProps}
    />
  );
};

export default CustomPhoneInput;

const styles = (isFocused?: boolean) =>
  StyleSheet.create({
    container: {backgroundColor: 'transparent', width: '100%'},
    textInput: {
      backgroundColor: 'transparent',
      fontFamily: SEMIBOLD,
      color: 'white',
    },

    codeTextStyle: {
      backgroundColor: 'transparent',
      fontFamily: SEMIBOLD,
      color: 'white',
    },
    textContainerStyle: {
      backgroundColor: 'transparent',
      borderBottomWidth: isFocused ? 2 : 0.5,
      borderBottomColor: isFocused ? 'rgba(255, 255, 255, 0.45)' : '#000',
    },
    flagButtonStyle: {
      borderBottomWidth: isFocused ? 2 : 0.5,
      borderBottomColor: isFocused ? 'rgba(255, 255, 255, 0.45)' : '#000',
    },
  });

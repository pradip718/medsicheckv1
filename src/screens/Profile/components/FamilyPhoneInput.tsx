import React, {useRef} from 'react';
import {Control, Controller} from 'react-hook-form';
import {StyleSheet} from 'react-native';
import PhoneInput, {PhoneInputProps} from 'react-native-phone-number-input';
import useLanguageStore from '../../../../store/languageStore';
import {Family} from '../../../../types/users/user';
import {parsePhoneNumber} from '../../../../utils/methods';
import {SEMIBOLD} from '../../../constants/Fonts';

interface FamilyPhoneInputProps extends PhoneInputProps {
  control: Control<Family, any, Family>;
}

const FamilyPhoneInput = ({
  control,
  disabled,
  ...restProps
}: FamilyPhoneInputProps) => {
  const phoneInput = useRef<PhoneInput>(null);
  const {languages} = useLanguageStore();

  return (
    <>
      <Controller
        name="phone_number"
        control={control}
        rules={{
          // required: 'Phone Number is Required',
          pattern: {
            value: /^\+(?:[0-9] ?){6,14}[0-9]$/,
            message: languages?.phone_number_must_be_valid,
          },
        }}
        render={({field: {onChange, value, onBlur}}) => (
          <>
            <PhoneInput
              ref={phoneInput}
              defaultCode={
                value ? parsePhoneNumber(value)?.regionCode ?? 'MX' : 'MX'
              }
              layout="first"
              value={
                value ? parsePhoneNumber(value)?.nationalNumber ?? value : value
              }
              placeholder={languages?.phone}
              onChangeFormattedText={onChange}
              containerStyle={styles({disabled}).container}
              textInputStyle={styles({disabled}).textInput}
              codeTextStyle={styles({disabled}).codeTextStyle}
              textContainerStyle={styles({disabled}).textContainerStyle}
              flagButtonStyle={styles({disabled}).flagButtonStyle}
              withShadow
              textInputProps={{
                placeholderTextColor: 'gray',
                onBlur: onBlur,
              }}
              disabled={disabled}
              // autoFocus
              {...restProps}
            />
          </>
        )}
      />
    </>
  );
};

export default FamilyPhoneInput;

const styles = ({disabled}: {disabled: boolean | undefined}) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      width: '100%',
      height: '100%',
    },
    textInput: {
      fontFamily: SEMIBOLD,
      color: disabled ? 'rgb(100 116 139)' : '#000',
      backgroundColor: 'transparent',
    },
    codeTextStyle: {
      backgroundColor: 'transparent',
      fontFamily: SEMIBOLD,
      color: disabled ? 'rgb(100 116 139)' : '#000',
    },
    textContainerStyle: {
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
      height: '100%',
    },
    flagButtonStyle: {
      borderBottomWidth: 0,
    },
  });

import React from 'react';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../../../store/languageStore';
import RoundedButton from '../../../../../components/RoundedButton';
import CustomText from '../../../../../components/Text';

export const NextButton = ({
  text,
  onPress,
  disabled,
  containerClassName,
}: {
  onPress: () => void;
  disabled?: boolean;
  containerClassName?: string;
  text?: string;
}) => {
  const {languages} = useLanguageStore();

  return (
    <RoundedButton
      resetStyle
      className={twMerge(
        'bg-ultramarineBlue py-2 w-5/6 self-center',
        containerClassName,
      )}
      onPress={onPress}
      disabled={disabled}>
      <CustomText
        className="text-lg text-white font-isidoraSemiBold px-2"
        numberOfLines={1}>
        {text ? text : languages?.next}
      </CustomText>
    </RoundedButton>
  );
};

export const PreviousButton = ({
  onPress,
  disabled,
  containerClassName,
}: {
  onPress: () => void;
  disabled?: boolean;
  containerClassName?: string;
}) => {
  const {languages} = useLanguageStore();

  return (
    <RoundedButton
      resetStyle
      className={twMerge(
        'bg-ultramarineBlue py-2 w-5/6 self-center',
        containerClassName,
      )}
      onPress={onPress}
      disabled={disabled}>
      <CustomText
        className="text-lg text-white font-isidoraSemiBold px-2"
        numberOfLines={1}>
        {languages?.previous}
      </CustomText>
    </RoundedButton>
  );
};

export const SkipButton = ({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) => {
  const {languages} = useLanguageStore();

  return (
    <RoundedButton
      resetStyle
      className="py-2 w-5/6 self-center"
      onPress={onPress}
      disabled={disabled}>
      <CustomText
        className="text-lg font-isidoraSemiBold underline text-slate-600"
        numberOfLines={1}>
        {languages?.skip}
      </CustomText>
    </RoundedButton>
  );
};

import moment from 'moment';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {TimeValidation} from '../../../../types/preventix';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import useGetDeviceLocale from '../../../hooks/useGetDeviceLocale';

interface RenderTimeFormatProps {
  handleSelectedAnswers: (answers: any) => void;
  selectedAnswers: any;
  type: 'date' | 'time' | 'datetime';
  validations: TimeValidation;
}

const RenderTImeFormat = ({
  selectedAnswers,
  handleSelectedAnswers,
  type,
  validations,
}: RenderTimeFormatProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [localDate, setLocalDate] = useState(selectedAnswers);
  const [error, setError] = useState('');
  const {isEnglish} = useGetDeviceLocale();

  const getFormatBasedOnType = () => {
    if (type === 'date') {
      return 'YYYY/MM/DD';
    }
    if (type === 'time') {
      return 'HH:mm';
    }
    if (type === 'datetime') {
      return 'YYYY-MM-DD HH:mm';
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // const handleDate = (date: Date) => {
  //   setLocalDate(moment(date).format(getFormatBasedOnType()));
  //   handleSelectedAnswers(moment(date).format(getFormatBasedOnType()));
  //   hideDatePicker();
  // };

  const handleDate = (date: Date) => {
    setError('');
    const selectedDateTime = moment(date);
    const currentDateTime = moment();

    const timeDifference = Math.abs(
      selectedDateTime.diff(currentDateTime, 'hours'),
    );

    setLocalDate(selectedDateTime.format(getFormatBasedOnType()));

    if (timeDifference < validations?.min_difference) {
      setError(
        isEnglish
          ? validations?.error_msg?.eng
          : validations?.error_msg?.spanish,
      );
      handleSelectedAnswers('');
      hideDatePicker();
      return;
    }
    handleSelectedAnswers(selectedDateTime.format(getFormatBasedOnType()));
    hideDatePicker();
  };

  return (
    <View
      style={styles.container}
      className="flex-1 h-full justify-center items-center">
      <TouchableOpacity
        className="flex-row pl-2 justify-between items-center overflow-hidden"
        style={styles.borderHighlightedColor}
        onPress={showDatePicker}>
        <CustomText className="font-isidoraSemiBold text-base flex-grow">
          {selectedAnswers}{' '}
        </CustomText>
        <View className="h-10 px-4 items-center justify-center">
          <Icon name="pending" size={20} color="rgba(151, 151, 151, 1)" />
        </View>
      </TouchableOpacity>
      {!!error && (
        <CustomText className="text-red-400 font-isidoraSemiBold text-sm py-4">
          {error}
        </CustomText>
      )}

      <DatePicker
        modal
        open={isDatePickerVisible}
        date={
          localDate
            ? moment(localDate, getFormatBasedOnType()).toDate()
            : new Date()
        }
        onConfirm={handleDate}
        mode={type}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
        minimumDate={new Date('1900-01-01')}
      />
    </View>
  );
};

export default RenderTImeFormat;

const styles = StyleSheet.create({
  container: {},
  borderHighlightedColor: {
    borderWidth: 1,
    minWidth: 175,
    maxWidth: 200,
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
});

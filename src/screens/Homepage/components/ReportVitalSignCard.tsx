import moment from 'moment';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';

const VitalSignCard = ({timeframe}: {timeframe: string}) => {
  const {languages} = useLanguageStore();
  return (
    <View
      className="px-6 py-4 justify-between shadow-2xl bg-white"
      style={styles.vitalSignCard}>
      <CustomText className="text-base font-isidoraSemiBold text-center">
        {languages?.my_vital_signs}
      </CustomText>

      <CustomText className="text-sm font-isidoraMedium text-center">
        {moment(timeframe).format('DD-MMM-YYYY, h:mm a')}
      </CustomText>
    </View>
  );
};

export default VitalSignCard;

const styles = StyleSheet.create({
  vitalSignCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
});

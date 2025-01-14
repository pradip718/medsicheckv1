import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Divider} from 'react-native-paper';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';
import {SEMIBOLD} from '../../../constants/Fonts';

type SortReportProps = {
  hideModal: () => void;
  sortOrder: SortOrder;
  sortField: SortField;
  handleSortFieldChange: (sortField: SortField) => void;
  handleSortOrderChange: (sortOrder: SortOrder) => void;
};

const getSelectedSortStyle = (
  selectedParams: SortField | SortOrder,
  params: SortField | SortOrder,
) => {
  if (selectedParams === params) {
    return {
      backgroundColor: '#B2C1FF',
      fontFamily: SEMIBOLD,
    };
  }
};

const SortReport = ({
  // hideModal,
  sortField,
  sortOrder,
  handleSortFieldChange,
  handleSortOrderChange,
}: SortReportProps) => {
  const {languages} = useLanguageStore();
  return (
    <View style={styles.sortReportModalContainer}>
      <TouchableOpacity
        className="w-[122px] h-[35px] rounded-3xl justify-center items-center"
        style={{
          backgroundColor: getSelectedSortStyle(sortField, 'Date')
            ?.backgroundColor,
        }}
        onPress={() => handleSortFieldChange('Date')}>
        <CustomText
          className="text-center font-isidoraSemiBold text-sm text-black"
          style={{
            fontFamily: getSelectedSortStyle(sortField, 'Date')?.fontFamily,
          }}>
          {languages?.date_sort}
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-[122px] h-[35px] rounded-3xl justify-center items-center my-2"
        style={{
          backgroundColor: getSelectedSortStyle(sortField, 'Score')
            ?.backgroundColor,
        }}
        onPress={() => handleSortFieldChange('Score')}>
        <CustomText
          className="text-center font-isidoraRegular text-sm text-black"
          style={{
            fontFamily: getSelectedSortStyle(sortField, 'Score')?.fontFamily,
          }}>
          {languages?.score_sort}
        </CustomText>
      </TouchableOpacity>
      <Divider className="bg-[#8BA2FF] h-[1px] w-full" />

      <TouchableOpacity
        className="w-[122px] h-[35px] bg-[#B2C1FF] rounded-3xl justify-center items-center mt-2"
        style={{
          backgroundColor: getSelectedSortStyle(sortOrder, 'Ascending')
            ?.backgroundColor,
        }}
        onPress={() => handleSortOrderChange('Ascending')}>
        <CustomText
          className="text-center font-isidoraSemiBold text-sm text-black"
          style={{
            fontFamily: getSelectedSortStyle(sortOrder, 'Ascending')
              ?.fontFamily,
          }}>
          {languages?.ascending}
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-[122px] h-[35px] rounded-3xl justify-center items-center my-2"
        style={{
          backgroundColor: getSelectedSortStyle(sortOrder, 'Descending')
            ?.backgroundColor,
        }}
        onPress={() => handleSortOrderChange('Descending')}>
        <CustomText
          className="text-center font-isidoraRegular text-sm text-black"
          style={{
            fontFamily: getSelectedSortStyle(sortOrder, 'Descending')
              ?.fontFamily,
          }}>
          {languages?.descending}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default SortReport;

const styles = StyleSheet.create({
  sortReportModalContainer: {
    backgroundColor: 'rgba(216, 224, 255, 1)',
    width: 150,
    // height: 436,
    height: 200,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
});

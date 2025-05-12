import CheckBox from '@react-native-community/checkbox';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import useLanguageStore from '../../../../store/languageStore';
import {ReportPaginationReadingData} from '../../../../types/jsons';
import {errorToast} from '../../../../utils/toast';
import {deleteReports} from '../../../api/report';
import {notifyApi} from '../../../api/user';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import useGetUserReading from '../../../hooks/api/useGetUserReading';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import customColor from '../../../theme/customColor';
import SortReport from '../Modal/SortReport';
import PreviousReportCard from '../components/PreviousReportCard';

const PreviousReports = () => {
  const queryClient = useQueryClient();
  const {
    data: reportData,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useGetUserReading();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [visible, setVisible] = useState(false);
  const [readings, setReadings] = useState<ReportPaginationReadingData[]>([]);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    if (reportData?.data?.reading_data) {
      setReadings(reportData?.data?.reading_data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const {mutateAsync: deletePreviousReports} = useMutation({
    onMutate: showLoader,
    mutationKey: ['DeleteReport'],
    mutationFn: deleteReports,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['readings']});
      resetState();
    },
    onError: error => errorToast(error?.message),
    onSettled: hideLoader,
  });

  const handleSortChange = ({
    order,
    field,
  }: {
    order: SortOrder;
    field: SortField;
  }) => {
    if (field === 'Date') {
      if (order === 'Ascending') {
        setReadings(
          readings.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        );
      } else {
        setReadings(
          readings.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
      }
    }
    if (field === 'Score') {
      if (order === 'Ascending') {
        setReadings(
          readings.sort((a, b) => a.WELLNESS_INDEX - b.WELLNESS_INDEX),
        );
      } else {
        setReadings(
          readings.sort((a, b) => b.WELLNESS_INDEX - a.WELLNESS_INDEX),
        );
      }
    }
  };

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
    handleSortChange({field: field, order: sortOrder});
  };
  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    handleSortChange({field: sortField, order});
  };

  const handleSelectReport = (isChecked: boolean, reportId: string) => {
    if (isChecked) {
      setSelectedReportIds([...selectedReportIds, reportId]);
    } else {
      setSelectedReportIds(selectedReportIds.filter(id => id !== reportId));
    }
  };

  const handleSelectAllReports = () => {
    if (allSelected) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(readings.map(report => report.reading_id));
    }
    setAllSelected(!allSelected);
  };

  const handleEditing = () => setIsEditing(!isEditing);
  const cancelEditing = () => setIsEditing(false);
  const resetState = () => {
    setIsEditing(false);
    setSelectedReportIds([]);
    setAllSelected(false);
  };

  const handleDeleteReport = async () => {
    if (selectedReportIds.length === 0) {
      return errorToast(languages?.deleteReportMessage);
    }
    await deletePreviousReports({reading_id: selectedReportIds});
    await notifyApi('delete_report');
  };

  const renderFilterReports = () => {
    return (
      <View className="flex-row justify-end items-center">
        <TouchableOpacity className="py-1" onPress={showModal}>
          <CustomText className="text-cardBlueBackground font-semibold">
            {languages?.sort_by}:{' '}
          </CustomText>
        </TouchableOpacity>
        <CustomText className="text-cardBlueBackground font-semibold">
          {sortField}{' '}
        </CustomText>
        <CustomText className="text-lg font-isidoraBold text-black">
          {sortOrder === languages?.ascending ? '⬆' : ''}
          {sortOrder === languages?.descending ? '⬇' : ''}
        </CustomText>
      </View>
    );
  };

  const renderHeaderComponent = () => (
    <View>
      <Navbar />
      <CustomText className="mt-6 text-2xl text-ultramarineBlue font-bold">
        {languages?.previous_report_title}
      </CustomText>

      <View className="mt-4 items-center flex-row space-x-2">
        <CustomText className="text-base text-cardBlueBackground font-semibold flex-1">
          {languages?.previous_report_scores_title}
        </CustomText>

        <View>
          {renderFilterReports()}
          <View className="flex-row justify-end space-x-3">
            {isEditing && (
              <TouchableOpacity onPress={handleSelectAllReports}>
                <CustomText
                  className={
                    'underline text-ultramarineBlue text-right font-isidoraSemiBold text-base mb-4'
                  }>
                  {allSelected
                    ? languages?.unselect_all
                    : languages?.select_all}
                </CustomText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={isEditing ? handleDeleteReport : handleEditing}>
              <CustomText
                className={`underline ${
                  isEditing ? 'text-red-400' : 'text-ultramarineBlue'
                } text-right font-isidoraSemiBold text-base mb-4`}>
                {isEditing ? languages?.delete : languages?.edit}
              </CustomText>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={cancelEditing}>
                <CustomText className="underline text-ultramarineBlue text-right font-isidoraSemiBold text-base mb-4">
                  {languages?.cancel}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderItem = ({item}: {item: ReportPaginationReadingData}) => (
    <View className="mt-4 flex-row items-center space-x-4">
      {isEditing && (
        <CheckBox
          tintColors={{true: '#3E64FF', false: '#3E64FF'}}
          onValueChange={value => handleSelectReport(value, item.reading_id)}
          value={selectedReportIds?.includes(item.reading_id)}
        />
      )}
      <View className="flex-1">
        <PreviousReportCard
          score={item.WELLNESS_INDEX || 0}
          id={item.reading_id}
          timeframe={item.created_at}
        />
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={readings}
          renderItem={renderItem}
          ListHeaderComponent={renderHeaderComponent}
          ListFooterComponent={
            <View style={styles.listFooterComponent}>
              {isFetchingNextPage && (
                <ActivityIndicator
                  size="large"
                  color={customColor.ultramarineBlue}
                />
              )}
            </View>
          }
          onEndReached={() => {
            hasNextPage && fetchNextPage();
          }}
          keyExtractor={item => item.reading_id.toString()}
          className="px-6 pt-6"
          contentContainerStyle={styles.contentContainer}
        />
      </SafeAreaView>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          style={styles.modalStyle}
          contentContainerStyle={styles.modalContentContainer}>
          <SortReport
            hideModal={hideModal}
            handleSortFieldChange={handleSortFieldChange}
            handleSortOrderChange={handleSortOrderChange}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        </Modal>
      </Portal>
    </>
  );
};

export default PreviousReports;

const styles = StyleSheet.create({
  container: {
    // paddingBottom: 150,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  modalContentContainer: {
    marginTop: 170,
    marginRight: 20,
  },
  modalStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  listFooterComponent: {
    flexDirection: 'row',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

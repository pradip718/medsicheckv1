import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {isEmpty} from 'lodash';
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
import useVoiceScanStore from '../../../../store/voiceScanStore';
import {
  isVoiceScanReport,
  VoiceReportPaginationData,
} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast} from '../../../../utils/toast';
import {notifyApi} from '../../../api/user';
import {
  deleteVoiceScanReport,
  getVoiceScanReportDetail,
} from '../../../api/voicescan';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {
  DELETE_VOICE_SCAN_REPORT_LIST,
  GET_VOICE_SCAN_REPORT_DETAIL,
  GET_VOICE_SCAN_REPORT_LIST,
} from '../../../constants/hooks';
import {useGetUserVoiceReportList} from '../../../hooks/api/voiceScan';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import customColor from '../../../theme/customColor';
import SortReport from '../../Homepage/Modal/SortReport';
import PreviousReportCard from '../../Homepage/components/PreviousReportCard';

const VoiceScanReportList = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {
    data: reportData,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetched,
  } = useGetUserVoiceReportList();
  const {languages} = useLanguageStore();
  const {setReportDetail} = useVoiceScanStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [visible, setVisible] = useState(false);
  const [readings, setReadings] = useState<VoiceReportPaginationData[]>([]);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const {mutateAsync: getUserVoiceReportDetail} = useMutation({
    onMutate: showLoader,
    onSettled: hideLoader,
    mutationKey: [GET_VOICE_SCAN_REPORT_DETAIL],
    mutationFn: getVoiceScanReportDetail,
    onSuccess: (reportDetail, variable) => {
      const {sessoin_id} = variable;
      if (isVoiceScanReport(reportDetail)) {
        setReportDetail(reportDetail);
        navigation.navigate('VoiceScanReport', {
          session_id: sessoin_id,
        });
      }
    },
  });

  useEffect(() => {
    if (reportData?.data?.reading_data && isFetched) {
      setReadings(reportData?.data?.reading_data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const {mutateAsync: deletePreviousReports} = useMutation({
    onMutate: showLoader,
    mutationKey: [DELETE_VOICE_SCAN_REPORT_LIST],
    mutationFn: deleteVoiceScanReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [GET_VOICE_SCAN_REPORT_LIST],
      });
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
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
        );
      } else {
        setReadings(
          readings.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        );
      }
    }
    if (field === 'Score') {
      if (order === 'Ascending') {
        setReadings(
          readings.sort((a, b) => a.wellness_score - b.wellness_score),
        );
      } else {
        setReadings(
          readings.sort((a, b) => b.wellness_score - a.wellness_score),
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
      setSelectedReportIds(readings.map(report => report.session_id));
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
    await deletePreviousReports({session_id: selectedReportIds});
    await notifyApi('delete_voice_scan_report', {
      session_ids: selectedReportIds,
    });
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

      <View className="mt-4 items-center flex-row justify-between">
        <CustomText className="text-base text-cardBlueBackground font-semibold">
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

  const renderItem = ({item}: {item: VoiceReportPaginationData}) => (
    <View className="mt-4 flex-row items-center space-x-4">
      {isEditing && (
        <CheckBox
          tintColors={{true: '#3E64FF', false: '#3E64FF'}}
          onValueChange={value => handleSelectReport(value, item.session_id)}
          value={selectedReportIds?.includes(item.session_id)}
        />
      )}
      <View className="flex-1">
        <PreviousReportCard
          score={item.wellness_score || 0}
          id={item.session_id}
          timeframe={item.timestamp}
          onReportPress={() => {
            getUserVoiceReportDetail({
              sessoin_id: item?.session_id ?? '',
            });
          }}
        />
      </View>
    </View>
  );

  if (isEmpty(reportData?.data?.reading_data)) {
    return (
      <View className="flex-1 bg-white p-4">
        <Navbar hasClose />
        <View className="flex-1 items-center justify-center">
          <CustomText className="text-center text-lg font-isidoraSemiBold">
            {languages?.no_report_available}
          </CustomText>
        </View>
      </View>
    );
  }

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
          keyExtractor={item => item.session_id.toString()}
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

export default VoiceScanReportList;

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

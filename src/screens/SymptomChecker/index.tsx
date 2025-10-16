import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import _ from 'lodash';
import moment from 'moment';
import {MotiTransitionProp, StyleValueWithReplacedTransforms, View} from 'moti';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import {MainStackParamList} from '../../../types/navigation';
import {SymptomReportList} from '../../../types/api_response';
import {notifyApi} from '../../api/user';
import {
  useDeleteSymptomReports,
  useGetSymptomReports,
} from '../../hooks/api/symptomchecker';
import {SYMPTOM_CHECKER_REPORTS} from '../../constants/hooks';
import {getSymptomQuestion} from '../../api/symptomchecker';
import useSymptomChecker from '../../hooks/useSymptomChecker';
import Loader from '../../components/Loader';
import EmptyScreen from '../../components/EmptyScreen';
import Navbar from '../../components/Navbar';
import CustomText from '../../components/Text';
import RoundedButton from '../../components/RoundedButton';
import Icon from '../../components/Icon';
import customColor from '../../theme/customColor';
import DeleteModal from '../../components/AlertModal/DeleteModal';
import {isAndroid} from '../../../utils';
import SortReport from '../HealthWallet/SortReport';

const RenderFilterReports = ({
  onReportListChange,
  reportList,
}: {
  onReportListChange: (list: SymptomReportList[]) => void;
  reportList: SymptomReportList[] | undefined;
}) => {
  const {languages} = useLanguageStore();

  const [sortField, setSortField] = useState<SortField>('Date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('');
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleSortChange = ({
    order,
    field,
  }: {
    order: SortOrder;
    field: SortField;
  }) => {
    if (!reportList) {
      return;
    }
    if (field === 'Date') {
      if (order === 'Ascending') {
        onReportListChange(
          reportList
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            )
            ?.map(each => each),
        );
      } else {
        onReportListChange(
          reportList
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            ?.map(each => each),
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

  return (
    <View>
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={showModal}>
        <CustomText className="text-cardBlueBackground font-semibold">
          {languages?.sort_by}:{' '}
        </CustomText>
        <CustomText className="text-cardBlueBackground font-semibold">
          {sortField}{' '}
        </CustomText>
        <CustomText className="text-lg font-isidoraBold text-black">
          {sortOrder === languages?.ascending ? '⬆' : ''}
          {sortOrder === languages?.descending ? '⬇' : ''}
        </CustomText>
      </TouchableOpacity>
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
    </View>
  );
};

const InterpretLabReports = () => {
  const {languages} = useLanguageStore();
  const queryClient = useQueryClient();
  const {showLoader, hideLoader} = useFullPageLoader();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const {symptomCheckerNavigation} = useSymptomChecker();

  const [reportList, setReportList] = useState<SymptomReportList[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [deleteTokenIds, setDeleteTokenIds] = useState<string[]>([]);

  useEffect(() => {
    notifyApi('sc_report_history');
  }, []);

  const {
    data: symptomReportList,
    isLoading: isSymptomReportLoading,
    refetch: getSymptomReportList,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useGetSymptomReports({
    staleTime: Infinity,
  });
  const {mutateAsync: deleteLabReport} = useDeleteSymptomReports({
    onMutate: () => {
      setIsDeleteVisible(false);
      showLoader();
    },
    onSettled: hideLoader,
    onSuccess: async () => {
      notifyApi('sr_report_deletion', {delete_token_ids: deleteTokenIds});
      await queryClient.invalidateQueries({
        queryKey: [SYMPTOM_CHECKER_REPORTS],
      });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (symptomReportList) {
      onReportListChange(symptomReportList?.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const onSelectDeleteRow = (tokens: string[]) => {
    setDeleteTokenIds(tokens);
  };

  const handleDelete = async () => {
    await deleteLabReport(deleteTokenIds);
  };

  const onReportListChange = (list: SymptomReportList[]) => {
    setReportList(list);
  };
  const hideDeleteModal = () => {
    setIsDeleteVisible(false);
  };
  const showDeleteModal = () => {
    setIsDeleteVisible(true);
  };
  const onChangeEditing = (editing: boolean) => {
    setIsEditing(editing);
  };

  const checkSymptoms = async () => {
    showLoader();
    const response = await getSymptomQuestion({type: 'latest'});
    if (response?.data?.q_id) {
      symptomCheckerNavigation(response, false, true);
    }
    hideLoader();
  };

  const handleValueChange = (tokenId: string) => {
    if (!deleteTokenIds?.includes(tokenId)) {
      onSelectDeleteRow([...deleteTokenIds, tokenId]);
    } else {
      onSelectDeleteRow(deleteTokenIds.filter(id => id !== tokenId));
    }
  };

  if (isSymptomReportLoading) {
    return <Loader hasNavbar message={languages?.symptom_report_loading} />;
  }

  if (_.isEmpty(reportList)) {
    return <EmptyScreen message={languages?.empty_lab_report} />;
  }

  const renderHeader = () => {
    return (
      <>
        <View className="py-4">
          <Navbar />
        </View>
        <View className="px-4">
          <View className="flex-row items-center">
            <CustomText className="text-2xl text-ultramarineBlue font-isidoraBold flex-1 mr-2">
              {languages?.symptom_checker_report}
            </CustomText>
            <RenderFilterReports
              onReportListChange={onReportListChange}
              reportList={reportList}
            />
          </View>

          <View className="items-end py-4">
            {isEditing ? (
              <View className="flex-row space-x-4">
                <CustomText
                  className="font-isidoraSemiBold text-red-400 underline text-base"
                  onPress={showDeleteModal}>
                  {languages?.delete}
                </CustomText>
                <CustomText
                  onPress={() => onChangeEditing(false)}
                  className="font-isidoraSemiBold text-ultramarineBlue underline text-base">
                  {languages?.cancel}
                </CustomText>
              </View>
            ) : (
              <CustomText
                className="font-isidoraSemiBold text-ultramarineBlue underline text-base"
                onPress={() => onChangeEditing(true)}>
                {languages?.edit}
              </CustomText>
            )}
          </View>

          <RoundedButton
            resetStyle
            className="py-2 border border-[#6D88F8] space-x-4 items-center"
            onPress={checkSymptoms}>
            <Icon name="plus" color={'#6D88F8'} size={20} />
            <CustomText className="text-[#6D88F8] text-base font-isidoraSemiBold">
              {languages?.check_symptoms_now}
            </CustomText>
          </RoundedButton>

          {/* <RenderReportList
          reportList={reportList}
          isEditing={isEditing}
          onSelectDeleteRow={onSelectDeleteRow}
          deleteTokenIds={deleteTokenIds}
        /> */}
        </View>
      </>
    );
  };

  const renderItem = ({item: list}: {item: SymptomReportList}) => {
    const isInProgress = list?.status === 'processed';

    const onPress = () => {
      if (isEditing) {
        return handleValueChange(list.token_id);
      }

      if (isInProgress) {
        navigation.navigate('SymptomGenerating', {
          isProgress: true,
        });
        return;
      }

      navigation.navigate('SymptomCheckerReport', {
        token_id: list?.token_id,
      });
    };

    return (
      <TouchableOpacity
        className="flex-row items-center justify-between border border-[#868686] rounded-3xl px-4 py-4 mt-4"
        activeOpacity={0.4}
        onPress={onPress}>
        <View className="flex-row items-center space-x-2 h-4">
          {isEditing && (
            <View
              from={{opacity: 0, translateX: -20}}
              animate={{opacity: 1, translateX: 0}}
              transition={
                {duration: 500, type: 'timing'} as MotiTransitionProp<
                  StyleValueWithReplacedTransforms<ViewStyle>
                >
              }>
              <CheckBox
                boxType="square"
                style={styles.checkBox}
                lineWidth={2}
                tintColors={{true: 'black', false: 'black'}}
                onCheckColor="black"
                onFillColor="white"
                onValueChange={() => handleValueChange(list.token_id)}
                value={deleteTokenIds?.includes(list.token_id)}
              />
            </View>
          )}
          <View>
            <CustomText>
              {moment(list.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </CustomText>
          </View>
        </View>

        <View className="flex-row items-center">
          {isInProgress ? (
            <CustomText className="font-isidoraMedium text-sm text-[#FFC107] mr-3">
              {languages?.in_progress}
            </CustomText>
          ) : null}
          {!isEditing && (
            <Icon name="chevron-right" size={24} color={customColor.black} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView>
      <FlatList
        style={styles.container}
        data={reportList}
        refreshControl={
          <RefreshControl
            refreshing={isSymptomReportLoading}
            onRefresh={getSymptomReportList}
          />
        }
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
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
        keyExtractor={(item, index) => `${item.token_id}-${index}`}
        className="px-4"
      />

      <DeleteModal
        visible={isDeleteVisible}
        hideAlert={hideDeleteModal}
        message={{
          title: languages?.delete_header,
          content: languages?.delete_subheader,
        }}
        handleOk={handleDelete}
        handleCancel={hideDeleteModal}
      />
    </SafeAreaView>
  );
};

export default InterpretLabReports;

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  modalContentContainer: {
    marginTop: 100,
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

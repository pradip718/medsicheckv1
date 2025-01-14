/* eslint-disable react-hooks/exhaustive-deps */
import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {isArray, isEmpty} from 'lodash';
import moment from 'moment';
import {AnimatePresence, View} from 'moti';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Badge} from 'react-native-paper';
import {twMerge} from 'tailwind-merge';
import useAlertStore from '../../../store/alertStore';
import useLanguageStore from '../../../store/languageStore';
import {HelpDeskDetails} from '../../../types/helpdesk';
import {MainStackParamList} from '../../../types/navigation';
import {isAndroid} from '../../../utils';
import {compareOther} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import DeleteModal from '../../components/AlertModal/DeleteModal';
import Icon from '../../components/Icon';
import MotiFlatList from '../../components/MotiFlatList';
import Pressable from '../../components/Pressable';
import CustomText from '../../components/Text';
import {GET_HELP_DESK_DETAILS} from '../../constants/hooks';
import {
  useDeleteHelpDeskTicket,
  useGetHelpdeskDetails,
} from '../../hooks/api/helpdesk';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import customColor from '../../theme/customColor';

const OpenIssues = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {showLoader, hideLoader} = useFullPageLoader();

  const {languages} = useLanguageStore();
  const {showAlert} = useAlertStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [deleteTokenIds, setDeleteTokenIds] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const {
    data: helpDeskDetails,
    isLoading,
    isRefetching,
    refetch: getHelpDeskDetails,
  } = useGetHelpdeskDetails();

  const {mutateAsync: deleteHelpDeskTicket} = useDeleteHelpDeskTicket({
    onMutate: () => {
      setIsDeleteVisible(false);
      showLoader();
    },
    onSettled: hideLoader,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: [GET_HELP_DESK_DETAILS]});
      setIsEditing(false);
      setDeleteTokenIds([]);
      setIsSelectAll(false);
    },
    onError: error => {
      showAlert({title: languages?.error, content: error?.message});
    },
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  const openIssues = helpDeskDetails?.filter(
    detail => detail.status === 'open',
  );

  const onChangeEditing = (editing: boolean) => {
    setIsEditing(editing);
    if (!editing) {
      setDeleteTokenIds([]);
      setIsSelectAll(false);
    }
  };

  const showDeleteModal = () => {
    setIsDeleteVisible(true);
  };
  const hideDeleteModal = () => {
    setIsDeleteVisible(false);
  };

  const onPressIssue = (ticketId: string) => {
    if (!ticketId) {
      return errorToast(languages?.generic_error_message);
    }
    navigation.navigate('IssueDetails', {
      ticket_id: ticketId,
    });
  };

  const handleValueChange = (tokenId: string) => {
    if (!deleteTokenIds?.includes(tokenId)) {
      setDeleteTokenIds([...deleteTokenIds, tokenId]);
    } else {
      setDeleteTokenIds(deleteTokenIds.filter(id => id !== tokenId));
    }
  };

  const handleSelectAll = () => {
    setIsSelectAll(true);
    const allTokenIds = openIssues?.map(issue => issue.ticket_id) || [];
    setDeleteTokenIds(allTokenIds);
  };

  const handleUnselectAll = () => {
    setIsSelectAll(false);
    setDeleteTokenIds([]);
  };

  const handleDelete = async () => {
    await deleteHelpDeskTicket(deleteTokenIds);
  };

  const renderItem: ListRenderItem<HelpDeskDetails> = useCallback(
    ({item: detail}) => {
      return (
        <Pressable
          key={detail?.ticket_id}
          className="mt-4 flex-row justify-between items-center border py-2 px-4 rounded-2xl"
          onPress={() => {
            isEditing
              ? handleValueChange(detail?.ticket_id)
              : onPressIssue(detail?.ticket_id);
          }}>
          <AnimatePresence>
            <View className="flex-row space-x-4 items-center flex-1">
              {isEditing && (
                <CheckBox
                  boxType="square"
                  style={styles.checkBox}
                  lineWidth={2}
                  tintColors={{
                    true: customColor.ultramarineBlue,
                    false: customColor.ultramarineBlue,
                  }}
                  onCheckColor={customColor.ultramarineBlue}
                  onFillColor="white"
                  value={deleteTokenIds?.includes(detail?.ticket_id)}
                  disabled
                />
              )}
              <View>
                <CustomText className="text-sm font-isidoraSemiBold">
                  {compareOther(detail?.subject)
                    ? detail?.title
                    : detail?.subject}
                </CustomText>
                <CustomText className="text-sm font-isidoraMedium">
                  {moment(detail?.created_at).format('DD-MMM-YYYY | h:mm a')}{' '}
                </CustomText>
              </View>
            </View>
          </AnimatePresence>
          {!isEditing && (
            <View className="items-center flex-row">
              {!detail?.read_flag && (
                <CustomText className="text-sm font-isidoraMedium text-slate-500 mr-2">
                  {languages?.new_message}
                </CustomText>
              )}
              <Icon name="chevron-right" size={16} color={customColor.black} />
            </View>
          )}
          {!detail?.read_flag && (
            <Badge className="absolute -right-1 -top-1" size={12} />
          )}
        </Pressable>
      );
    },
    [isEditing, deleteTokenIds, openIssues, helpDeskDetails],
  );

  return (
    <View>
      <ScrollView
        // contentContainerStyle={{flex: 1, marginTop: 8}}
        contentContainerStyle={{paddingBottom: 80}}
        className="h-full mt-4"
        refreshControl={
          <RefreshControl
            onRefresh={getHelpDeskDetails}
            refreshing={isRefetching}
          />
        }>
        {isArray(openIssues) && isEmpty(openIssues) ? (
          <View className="justify-center items-center">
            <CustomText className="text-lg font-isidoraMedium text-slate-400">
              {languages?.empty_open_ticket}
            </CustomText>
          </View>
        ) : (
          <>
            <View className="items-end pr-6">
              {isEditing ? (
                <View className="flex-row space-x-4">
                  <Pressable
                    onPress={isSelectAll ? handleUnselectAll : handleSelectAll}>
                    <CustomText className="font-isidoraSemiBold text-ultramarineBlue underline text-base">
                      {isSelectAll
                        ? languages?.unselect_all
                        : languages?.select_all}
                    </CustomText>
                  </Pressable>
                  <Pressable
                    onPress={showDeleteModal}
                    disabled={isEmpty(deleteTokenIds)}>
                    <CustomText
                      className={twMerge(
                        'font-isidoraSemiBold text-red-400 underline text-base',
                        isEmpty(deleteTokenIds) && 'text-red-200',
                      )}>
                      {languages?.delete}
                    </CustomText>
                  </Pressable>
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
            <AnimatePresence>
              {isArray(openIssues) && (
                <MotiFlatList
                  data={openIssues as HelpDeskDetails[]}
                  renderItem={renderItem as ListRenderItem<any>}
                  keyExtractor={(item: any) => item?.ticket_id || ''}
                  className="px-6"
                  contentContainerStyle={styles.contentContainer}
                  from={{translateY: 200, opacity: 0.5}}
                  animate={{translateY: 0, opacity: 1}}
                  transition={{type: 'timing', duration: 500} as any}
                />
              )}
            </AnimatePresence>
          </>
        )}
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
      </ScrollView>
    </View>
  );
};

export default OpenIssues;

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.8}, {scaleY: 0.8}, {translateY: 2}],
  },
});

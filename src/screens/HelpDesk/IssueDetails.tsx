/* eslint-disable react-hooks/exhaustive-deps */
import {RouteProp} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {isArray} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {errorToast, successToast} from '../../../utils/toast';
import {postCreateCommunication} from '../../api/helpdesk';
import DeleteModal from '../../components/AlertModal/DeleteModal';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import Pressable from '../../components/Pressable';
import CustomText from '../../components/Text';
import {
  GET_COMMUNICATION_DETAILS,
  GET_HELP_DESK_DETAILS,
} from '../../constants/hooks';
import {
  useGetCommunicationDetails,
  usePatchTicket,
} from '../../hooks/api/helpdesk';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import customColor from '../../theme/customColor';
import Comments from './components/Comments';
import TicketDetails from './components/TicketDetails';

type IssueDetailsRouteProp = RouteProp<MainStackParamList, 'IssueDetails'>;

interface IssueDetailsProps {
  route: IssueDetailsRouteProp;
}

const IssueDetails = ({route}: IssueDetailsProps) => {
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {ticket_id} = route?.params || {};
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = React.useState(false);

  const renderScene = useCallback(
    SceneMap({
      ticket_details: useCallback(
        () => <TicketDetails ticket_id={ticket_id} />,
        [],
      ),
      comments: useCallback(() => <Comments ticket_id={ticket_id} />, []),
    }),
    [],
  );

  const [routes] = useState([
    {key: 'ticket_details', title: languages?.ticket_details},
    {key: 'comments', title: languages?.comments},
  ]);

  const {
    data: helpDeskDetails,
    refetch: refetchCommunicationDetails,
    isLoading,
    isRefetching,
  } = useGetCommunicationDetails({
    event_type: 'communication',
    ticket_id,
  });

  useEffect(() => {
    if (isArray(helpDeskDetails?.communication_detail)) {
      setHasUnreadMessage(
        helpDeskDetails?.communication_detail?.some(
          details =>
            helpDeskDetails?.ticket_detail?.[0]?.status === 'open' &&
            details?.sent_by !== 'user' &&
            !details?.read_flag,
        ),
      );
    }
  }, [helpDeskDetails]);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  useEffect(() => {
    const updateReadFlag = async () => {
      await postCreateCommunication({
        ticket_id,
        event_type: 'communication',
        read_flag: 'True',
      });
      queryClient.refetchQueries({queryKey: [GET_HELP_DESK_DETAILS]});
      setTimeout(() => {
        queryClient.refetchQueries({queryKey: [GET_COMMUNICATION_DETAILS]});
      }, languages?.communication_refetch_delay_time || 4000);
    };

    if (hasUnreadMessage) {
      setIndex(1);
      updateReadFlag();
    }
  }, [hasUnreadMessage]);

  const {mutateAsync: patchTicket, isPending: isUpdatingTicket} =
    usePatchTicket({
      onMutate: () => {
        hideResolveModal();
        showLoader();
      },
      onSettled: hideLoader,
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [GET_COMMUNICATION_DETAILS],
          }),
          queryClient.invalidateQueries({queryKey: [GET_HELP_DESK_DETAILS]}),
        ]);
        successToast(languages?.success_mark_resolve);
      },
      onError: () => {
        errorToast(languages?.ticket_create_error);
      },
    });

  const showResolveModal = () => {
    setVisible(true);
  };
  const hideResolveModal = () => {
    setVisible(false);
  };

  const onMarkAsResolve = async () => {
    await patchTicket({
      ticket_id,
      status: 'closed',
    });
  };

  const ticketDetails = helpDeskDetails?.ticket_detail?.find(
    ticket => ticket?.ticket_id === ticket_id,
  );
  const lastPartOfTicketId =
    ticketDetails?.ticket_id?.substring(
      ticketDetails?.ticket_id?.lastIndexOf('-') + 1,
    ) || '';

  const renderLabel = (props: any) => {
    return (
      <View className="px-4 w-[200] items-center">
        <CustomText
          numberOfLines={2}
          ellipsizeMode="middle"
          className={twMerge(
            'font-isidoraMedium text-base ',
            props?.focused && 'font-isidoraBold',
          )}>
          {props?.route?.title}
        </CustomText>
      </View>
    );
  };

  if (!ticket_id) {
    return <></>;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BasicContainer className="bg-white h-full">
        <SafeAreaView className="h-full mb-4">
          <View className="p-4">
            <Navbar />
          </View>

          <ImageBackground
            source={require('../../../assets/images/ai_details_header.png')}
            className="w-full relative h-14 justify-between items-center flex-row"
            resizeMode="cover">
            <View className="px-4">
              <CustomText className="smallPhone:text-sm font-isidoraSemiBold mediumPhone:text-base text-white">
                {languages?.ticket_no}:
                <CustomText className="font-isidoraBold text-white">
                  {lastPartOfTicketId}
                </CustomText>
              </CustomText>
            </View>
            <View className="px-4">
              {isRefetching ? (
                <ActivityIndicator color={customColor.white} size={'small'} />
              ) : (
                <Pressable
                  onPress={refetchCommunicationDetails}
                  className="self-end flex-grow">
                  <Icon name="refresh" size={20} color={customColor.white} />
                </Pressable>
              )}
            </View>
          </ImageBackground>

          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width: layout.width}}
            renderTabBar={props => (
              <TabBar
                {...props}
                style={{
                  backgroundColor: customColor.white,
                }}
                labelStyle={{
                  color: customColor.black,
                }}
                renderLabel={renderLabel}
                indicatorStyle={{
                  backgroundColor: customColor.ultramarineBlue,
                }}
              />
            )}
          />
          {helpDeskDetails?.ticket_detail?.[0]?.status === 'open' && (
            <>
              <Pressable
                className="bg-green-500 rounded-3xl px-6 py-2 self-center my-2"
                onPress={showResolveModal}
                disabled={isUpdatingTicket}>
                <View className="flex-row space-x-2 items-center">
                  <Icon name="checkmark2" size={20} color="#fff" />
                  <CustomText className="smallPhone::text-xs text-white font-isidoraSemiBold mediumPhone:text-lg">
                    {languages?.resolve}
                  </CustomText>
                </View>
              </Pressable>
              <DeleteModal
                visible={visible}
                hideAlert={hideResolveModal}
                message={{
                  title: languages?.resolve_modal_title,
                  content: languages?.resolve_modal_content,
                }}
                handleOk={onMarkAsResolve}
                handleCancel={hideResolveModal}
              />
            </>
          )}

          {/* <View className="px-4">
            <View className="flex-row space-x-2 items-center">
              <View className="flex-row space-x-2 items-center flex-1 flex-wrap">
                {ticketDetails?.status && (
                  <View className="border border-green-400 rounded-3xl px-4 justify-center items-center">
                    <CustomText className="smallPhone:text-xs mediumPhone:text-base">
                      {languages?.ticketStatus[
                        ticketDetails?.status as keyof typeof languages.ticketStatus
                      ] || ''}
                    </CustomText>
                  </View>
                )}
              </View>
              <View>
                {isRefetching ? (
                  <ActivityIndicator
                    color={customColor.ultramarineBlue}
                    size={'small'}
                  />
                ) : (
                  <Pressable
                    onPress={refetchCommunicationDetails}
                    className="self-end flex-grow">
                    <Icon
                      name="refresh"
                      size={20}
                      color={customColor.ultramarineBlue}
                    />
                  </Pressable>
                )}
              </View>
            </View>
            <ScrollView
              className="bg-slate-200 rounded-2xl  py-2 mt-2 max-h-32"
              contentContainerStyle={styles.descriptionContentContainer}>
              <View className="flex-row">
                <CustomText className="smallPhone:text-xs font-isidoraMedium mediumPhone:text-sm underline">
                  {compareOther(ticketDetails?.subject || '')
                    ? ticketDetails?.title
                    : ticketDetails?.subject}
                </CustomText>
                {ticketDetails?.priority && (
                  <CustomText className="smallPhone:text-xs font-isidoraSemiBold mediumPhone:text-sm">
                    {'  '}(
                    {languages?.issue_priorities?.priorities[
                      ticketDetails?.priority as keyof typeof languages.issue_priorities.priorities
                    ] || ''}
                    )
                  </CustomText>
                )}
              </View>
              <CustomText className="smallPhone:text-xs font-isidoraMedium text-sm mt-2">
                {ticketDetails?.description}
              </CustomText>
            </ScrollView>
          </View> */}
        </SafeAreaView>
      </BasicContainer>
    </KeyboardAvoidingView>
  );
};

export default IssueDetails;

// const styles = StyleSheet.create({
//   contentContainer: {
//     paddingBottom: 20,
//   },
//   descriptionContentContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//   },
//   profileImage: {
//     height: '100%',
//     width: '100%',
//     // width: 28,
//     resizeMode: 'cover',
//   },
// });

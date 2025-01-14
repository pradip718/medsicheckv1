/* eslint-disable react-hooks/exhaustive-deps */
import {isArray} from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Avatar} from 'react-native-paper';
import {twMerge} from 'tailwind-merge';
import {ProfileImg} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {
  AttachmentDetails,
  CommunicationDetails,
} from '../../../../types/helpdesk';
import {downloadFile} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import Icon from '../../../components/Icon';
import MotiFlatList from '../../../components/MotiFlatList';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import {
  useGetCommunicationDetails,
  usePostCommunication,
} from '../../../hooks/api/helpdesk';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import useGetProfileImage from '../../../hooks/useGetProfileImage';
import customColor from '../../../theme/customColor';

const ChatDetails = ({
  history,
  attachmentDetails,
}: {
  history: CommunicationDetails;
  attachmentDetails: AttachmentDetails[] | undefined;
}) => {
  const {currentActiveProfileId} = useUserProfileStore();
  const {avatarSource} = useGetProfileImage(currentActiveProfileId);
  const isUser = history?.sent_by === 'user';

  const selectedAttachmentIds = history.attachment_id
    ? JSON.parse(history.attachment_id)
    : [];
  const filteredAttachments =
    attachmentDetails?.filter(attachment =>
      selectedAttachmentIds.includes(attachment.attachment_id),
    ) || [];

  return (
    <View
      className={twMerge(
        'flex-row',
        isUser && 'justify-start flex-row-reverse',
      )}>
      {isUser ? (
        <View className="h-[28px] w-[28px] rounded-full overflow-hidden">
          <Image
            source={avatarSource || (ProfileImg as any)}
            style={styles.profileImage}
          />
        </View>
      ) : (
        <Avatar.Image
          size={24}
          source={require('../../../../assets/images/profileImage.png')}
          className="self-end"
        />
      )}
      <View
        className={twMerge(
          'border border-slate-500 rounded-2xl p-4 flex-1 mx-2',
          !isUser && !history.read_flag && 'border-purple-500',
        )}>
        <CustomText className="smallPhone:text-xs mediumPhone:text-sm">
          {history?.message}
        </CustomText>
        {filteredAttachments.length > 0 && (
          <View className="flex-row-reverse flex-wrap">
            {filteredAttachments.map(attachment => (
              <Pressable
                key={attachment.attachment_id}
                className="flex-row items-center border border-ultramarineBlue py-1 px-2 rounded-3xl mt-2 max-w-[110px] mr-2"
                onPress={() => downloadFile(attachment.attachment_link)}>
                <CustomText
                  className="text-sm text-ultramarineBlue font-isidoraMedium w-[80%]"
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {attachment.attachment_id}
                </CustomText>
                <View className="w-[20%] items-center">
                  <Icon
                    name="download"
                    size={16}
                    color={customColor.ultramarineBlue}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const Comments = ({ticket_id}: {ticket_id: string}) => {
  const scrollRef = useRef<FlatList>(null);
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<DocumentPickerResponse[]>([]);

  const {
    data: helpDeskDetails,
    refetch: refetchCommunicationDetails,
    isLoading,
    // isRefetching,
  } = useGetCommunicationDetails({
    event_type: 'communication',
    ticket_id,
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  const {mutateAsync: createCommunication, isPending} = usePostCommunication({
    onSuccess: async () => {
      await refetchCommunicationDetails();
      setMessage('');
      setFiles([]);
    },
  });

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      const filteredFiles = Array.isArray(res) ? res : [res];

      const validFiles = filteredFiles.filter(file =>
        file?.size ? file?.size <= 5 * 1024 * 1024 : false,
      );

      if (validFiles.length < filteredFiles.length) {
        errorToast(languages?.file_size_limitation);
      }

      setFiles([...files, ...validFiles]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // errorToast(languages?.select_document);
        console.log('err', err);
      } else {
        errorToast(languages?.generic_error_message);
      }
    }
  };

  const removeFile = (uri: string) => {
    setFiles(files.filter(file => file.uri !== uri));
  };

  const onSubmitMessage = async () => {
    await createCommunication({
      ticket_id,
      event_type: 'communication',
      message,
      files,
    });
  };

  const ticketDetails = helpDeskDetails?.ticket_detail?.find(
    ticket => ticket?.ticket_id === ticket_id,
  );

  const renderItem: ListRenderItem<CommunicationDetails> = ({
    item: history,
  }) => {
    return (
      <View className="mb-2">
        <ChatDetails
          history={history}
          attachmentDetails={helpDeskDetails?.attachment_detail}
        />
      </View>
    );
  };

  return (
    <>
      {isArray(helpDeskDetails?.communication_detail) ? (
        <MotiFlatList
          ref={scrollRef}
          data={helpDeskDetails?.communication_detail}
          renderItem={renderItem as ListRenderItem<any>}
          keyExtractor={(item: any) => item?.communication_id || ''}
          className="p-2"
          contentContainerStyle={styles.contentContainer}
          onContentSizeChange={() => {
            scrollRef?.current?.scrollToEnd({animated: true});
          }}
        />
      ) : (
        <View className="flex-1" />
      )}

      <View className="px-4">
        {files && isArray(files) && (
          <ScrollView horizontal>
            {files?.map((file, idx) => (
              <View
                key={`${file.uri}-${idx}`}
                className="flex-row border border-ultramarineBlue px-4 py-1 rounded-3xl space-x-2 items-center mt-2 mb-1 mr-2">
                <CustomText
                  className="text-sm text-ultramarineBlue font-isidoraMedium max-w-[80px]"
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {file.name}
                </CustomText>
                <Pressable
                  onPress={() => removeFile(file.uri)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon
                    name="close"
                    size={16}
                    color={customColor.errorTextRed}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {ticketDetails?.status !== 'closed' && (
          <>
            <View>
              <TextInput
                multiline
                className="smallPhone:text-xs mediumPhone:text-base my-1 border border-cornflowerBlue bg-slate-200 rounded-2xl max-h-[200px] py-4 text-black pr-10 pl-10"
                placeholder={languages?.communication_text_placeholder}
                placeholderTextColor="#a0a0a0"
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity
                className="absolute left-0 top-0  bottom-0 justify-center px-4"
                onPress={selectFile}>
                <Icon
                  name="attach_file"
                  size={20}
                  color={customColor.ultramarineBlue}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute right-2 top-0 px-2 bottom-0 justify-center"
                onPress={onSubmitMessage}
                disabled={!message}>
                {isPending ? (
                  <ActivityIndicator color={customColor.white} size={'small'} />
                ) : (
                  <Icon
                    name="send"
                    size={20}
                    color={customColor.ultramarineBlue}
                  />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default Comments;

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  descriptionContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  profileImage: {
    height: '100%',
    width: '100%',
    // width: 28,
    resizeMode: 'cover',
  },
});

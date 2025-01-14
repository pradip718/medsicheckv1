import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {AnimatePresence, ScrollView, View} from 'moti';
import React, {useState} from 'react';
import {TextInput} from 'react-native';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import {PostCreateTicket} from '../../../types/helpdesk';
import {MainStackParamList} from '../../../types/navigation';
import {compareOther} from '../../../utils/methods';
import {errorToast, successToast} from '../../../utils/toast';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import Pressable from '../../components/Pressable';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {GET_HELP_DESK_DETAILS} from '../../constants/hooks';
import {usePostCreateTicket} from '../../hooks/api/helpdesk';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import customColor from '../../theme/customColor';
import IssuePriority from './IssuePriority';
import TicketAttachments from './components/TicketAttachments';
import {IssuePriorityType} from './type';

const RaiseIssue = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const defaultPriority: IssuePriorityType =
    (languages?.issue_priorities?.default as IssuePriorityType) || 'Medium';

  const [selectedIssue, setSelectedIssue] = useState('');
  const [feedbacksTitle, setFeedbacksTitle] = useState('');
  const [feedbacksContent, setFeedbacksContent] = useState('');
  const [selectedPriority, setSelectedPriority] =
    useState<IssuePriorityType>(defaultPriority);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<DocumentPickerResponse[]>([]);

  const {mutateAsync: createTicket, isPending} = usePostCreateTicket({
    onMutate: showLoader,
    onSettled: hideLoader,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: [GET_HELP_DESK_DETAILS]});
      navigation.goBack();
      successToast(languages?.ticket_create_success);
    },
    onError: () => {
      errorToast(languages?.ticket_create_error);
    },
  });

  const onChangeFeedbacksTitle = (txt: string) => {
    setFeedbacksTitle(txt);
  };

  const onChangeSelectedIssue = (txt: string) => {
    setSelectedIssue(txt);
  };
  const onChangeFeedbacksContent = (txt: string) => {
    setFeedbacksContent(txt);
  };
  const onChangePriority = (txt: IssuePriorityType) => {
    setSelectedPriority(txt);
  };
  const onChangeFiles = (resFiles: DocumentPickerResponse[]) => {
    setFiles(resFiles);
  };

  const onSend = async () => {
    const filteredIssue = languages?.issue_list?.find(
      eachIssue => eachIssue.name === selectedIssue,
    );

    let payload: PostCreateTicket = {
      subject: selectedIssue,
      title: feedbacksTitle,
      description: feedbacksContent,
      priority: selectedPriority,
      status: 'open',
      sub_status: 'in review',
      tags: filteredIssue ? filteredIssue?.tags : [],
      files,
    };

    if (!compareOther(selectedIssue)) {
      delete payload.title;
    }

    await createTicket(payload);
  };

  const onSelectItem = (issue: string) => {
    onChangeSelectedIssue(issue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredIssues = languages?.issue_list?.filter(issue =>
    issue.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="bg-white">
      <SafeAreaScrollView
        className="p-4 h-full"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Navbar />
        <View className="flex-1">
          <CustomText className="font-isidoraSemiBold text-lg text-center mt-4">
            {languages?.raise_issue_title}
          </CustomText>

          <View className="mt-8">
            <CustomText className="font-isidoraMedium text-sm">
              {languages?.issue_title}
            </CustomText>
            <Pressable
              shouldScaleOnClick={false}
              className="border border-slate-400 rounded-lg p-2 mt-2 flex-row justify-between items-center"
              onPress={() => setIsOpen(open => !open)}>
              <CustomText className="flex-1">
                {selectedIssue
                  ? selectedIssue
                  : languages?.select_issue_placeholder}
              </CustomText>
              <Icon
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={customColor.ultramarineBlue}
              />
            </Pressable>
            <AnimatePresence>
              {isOpen && (
                <View
                  className="border border-t-0 border-cornflowerBlue rounded-xl overflow-hidden"
                  from={{height: 0, opacity: 0}}
                  animate={{height: 250, opacity: 1}}
                  exit={{height: 0, opacity: 0}}
                  transition={{type: 'timing', duration: 300} as any}>
                  <TextInput
                    placeholder={languages?.search_placeholder}
                    className="p-2 m-2 bg-slate-200 items-center justify-center h-10 text-black font-isidoraSemiBold text-sm rounded-lg"
                    placeholderTextColor="#a0a0a0"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <ScrollView nestedScrollEnabled>
                    {filteredIssues?.map((issue, idx) => (
                      <Pressable
                        key={issue.name}
                        className={twMerge(
                          'border-t px-4 border-cornflowerBlue',
                          idx === 0 && 'border-t-0',
                        )}
                        onPress={() => onSelectItem(issue.name)}>
                        <CustomText className="font-isidoraMedium p-2">
                          {issue.name}
                        </CustomText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </AnimatePresence>
          </View>

          {compareOther(selectedIssue) && (
            <View className="mt-8 space-y-2">
              <CustomText className="font-isidoraMedium text-sm">
                {languages?.issue_title}
              </CustomText>
              <TextInput
                multiline
                placeholder={languages?.issue_title_placeholder}
                placeholderTextColor="#a0a0a0"
                textAlignVertical="top"
                className="bg-slate-200 items-center justify-center h-10 text-black font-isidoraSemiBold p-2 text-sm rounded-lg"
                value={feedbacksTitle}
                onChangeText={onChangeFeedbacksTitle}
              />
            </View>
          )}
          <View className="mt-4 space-y-2">
            <CustomText className="font-isidoraMedium text-sm">
              {languages?.issue_description}
            </CustomText>
            <TextInput
              multiline
              textAlignVertical="top"
              placeholderTextColor="#a0a0a0"
              placeholder={languages?.issue_description_placeholder}
              className="bg-slate-200 h-40 text-black font-isidoraSemiBold p-2 text-sm rounded-lg"
              value={feedbacksContent}
              onChangeText={onChangeFeedbacksContent}
            />
          </View>
          <View className="mt-4">
            <IssuePriority
              selectedPriority={selectedPriority}
              onChangePriority={onChangePriority}
            />
          </View>
          <View className="mt-4">
            <TicketAttachments files={files} onChangeFiles={onChangeFiles} />
          </View>
          <RoundedButton
            className="my-10 self-center px-20 py-2 bg-ultramarineBlue"
            resetStyle
            disabled={!selectedIssue || !feedbacksContent || isPending}
            onPress={onSend}>
            <CustomText className="text-white font-isidoraSemiBold text-lg">
              {languages?.submit}
            </CustomText>
          </RoundedButton>
        </View>
      </SafeAreaScrollView>
    </View>
  );
};

export default RaiseIssue;

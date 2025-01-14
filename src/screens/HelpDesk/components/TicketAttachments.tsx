import {ScrollView} from 'moti';
import React from 'react';
import {View} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import useLanguageStore from '../../../../store/languageStore';
import {errorToast} from '../../../../utils/toast';
import BasicContainer from '../../../components/BasicContainer';
import Icon from '../../../components/Icon';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

type TicketAttachmentsProps = {
  files: DocumentPickerResponse[];
  onChangeFiles: (file: DocumentPickerResponse[]) => void;
};

const TicketAttachments = ({files, onChangeFiles}: TicketAttachmentsProps) => {
  const {languages} = useLanguageStore();

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

      onChangeFiles([...files, ...validFiles]);
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
    onChangeFiles(files.filter(file => file.uri !== uri));
  };

  return (
    <BasicContainer>
      <Pressable
        className="flex-row space-x-2 items-center border self-start px-2 py-1 rounded-3xl border-ultramarineBlue"
        onPress={selectFile}>
        <Icon name="attachment" size={16} color={customColor.ultramarineBlue} />
        <CustomText className="font-isidoraMedium text-sm text-ultramarineBlue">
          {languages?.add_attachments}
        </CustomText>
      </Pressable>
      <ScrollView className="mt-2 h-[100px]">
        <View className="flex-row flex-wrap gap-x-2 ">
          {files?.map((file, idx) => (
            <View
              key={`${file.uri}-${idx}`}
              className="flex-row border border-ultramarineBlue px-4 py-2 rounded-3xl space-x-2 items-center mt-2">
              <CustomText
                className="text-sm text-ultramarineBlue font-isidoraMedium max-w-[80px]"
                numberOfLines={1}
                ellipsizeMode="middle">
                {file.name}
              </CustomText>
              <Pressable
                onPress={() => removeFile(file.uri)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="close" size={16} color={customColor.errorTextRed} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </BasicContainer>
  );
};

export default TicketAttachments;

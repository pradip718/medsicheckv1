import _ from 'lodash';
import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import useLanguageStore from '../../../../store/languageStore';
import {ValidationType} from '../../../../types/personalisedai';
import {errorToast} from '../../../../utils/toast';
import EtchedGlass from '../../../components/EtchedGlass';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

interface RenderFileUploadProps {
  handleSelectedAnswers: (
    answers: {
      type: string;
      file: DocumentPickerResponse;
    } | null,
  ) => void;
  selectedAnswers: any;
  validations: ValidationType;
}

const RenderFileUpload = ({handleSelectedAnswers}: RenderFileUploadProps) => {
  const {languages} = useLanguageStore();
  const [file, setFile] = useState<any>(null);

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      if (!res.size) {
        return;
      }
      if (res.size > 5 * 1024 * 1024) {
        errorToast(languages?.file_size_limitation);
        removeFile();
        return;
      }
      setFile(res);
      handleSelectedAnswers({
        type: 'file',
        file: res,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        errorToast(languages?.select_document);
      } else {
        errorToast(languages?.generic_error_message);
      }
    }
  };

  const removeFile = () => {
    handleSelectedAnswers(null);
    setFile(null);
  };

  return (
    <View className="items-center flex-grow justify-center">
      {!_.isEmpty(file) && (
        <EtchedGlass
          cardContentClassName="justify-center items-center"
          cardContentContainerClassName="py-4">
          <View className="flex-row items-center">
            <View className="border border-ultramarineBlue px-4 py-2 rounded-full flex-row justify-center space-x-2">
              <Icon name="pdf" color={customColor.ultramarineBlue} size={20} />
              <CustomText
                className="text-sm font-isidoraMedium italic text-ultramarineBlue w-[80%]"
                numberOfLines={1}
                ellipsizeMode="middle">
                {file?.name}
              </CustomText>
            </View>
            <TouchableOpacity className="p-2" onPress={removeFile}>
              <Icon name="delete" color={'red'} size={20} />
            </TouchableOpacity>
          </View>
        </EtchedGlass>
      )}
      <RoundedButton
        resetStyle
        className="text-black rounded-full px-4 py-2 space-x-2 bg-cornflowerBlue mt-4"
        onPress={selectFile}>
        <Icon name="plus" color={customColor.ultramarineBlue} size={20} />
        <CustomText className="font-isidoraSemiBold text-base tablet:text-lg ">
          {languages?.upload_file}
        </CustomText>
      </RoundedButton>
    </View>
  );
};

export default RenderFileUpload;

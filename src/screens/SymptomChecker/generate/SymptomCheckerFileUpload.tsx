import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Asset,
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../../../../types/navigation';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import {usePostSymptomFileUpload} from '../../../hooks/api/symptomchecker';
import {errorToast} from '../../../../utils/toast';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import SymptomCheckerImageHandler from './components/SymptomCheckerImageHandler';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import DeleteModal from '../../../components/AlertModal/DeleteModal';
import useLanguageStore from '../../../../store/languageStore';

const SymptomCheckerFileUpload = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomImageUpload'>>();
  const languages = useLanguageStore(store => store.languages);

  const questionData = params;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openUpload, setOpenUpload] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<
    Asset[] | {id: string; url: string}[]
  >([]);

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const images = params?.image_url;
      if (images?.length) {
        setUploadedImages(images);
      }
    }
  }, [params]);

  const {onSubmit, isLoading: isSubmitting} = useSymptomChecker();
  const {mutate} = usePostSymptomFileUpload({
    onSuccess: async data => {
      console.log(data);
      const imagesWithIdToken = uploadedImages
        .filter(image => image.id)
        ?.map(image => image.id);
      const uploadedTokens = data.map(item => item.token_id);
      const tokens = [...(uploadedTokens || []), ...(imagesWithIdToken || [])];
      await onSubmit({
        eng_choices: JSON.stringify(tokens),
        spanish_choices: JSON.stringify(tokens),
        questionData,
        // isFromReportList: params?.isFromReportList || false,
      });
      setIsLoading(false);
    },
    onError: () => {
      errorToast();
      setIsLoading(false);
    },
  });

  const onReplace = () => {
    setOpenUpload(false);
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 0,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setUploadedImages(response.assets);
      } else {
        setUploadedImages([]);
      }
    });
  };

  const onNext = () => {
    if (!uploadedImages?.length) {
      onSubmit({
        eng_choices: JSON.stringify([]),
        spanish_choices: JSON.stringify([]),
        questionData,
      });
      return;
    }

    const imagesWithId = uploadedImages.filter(image => image.id);
    if (imagesWithId?.length) {
      const tokens = imagesWithId.map(image => image.id);
      onSubmit({
        eng_choices: JSON.stringify(tokens),
        spanish_choices: JSON.stringify(tokens),
        questionData,
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    const nonUploadedImages = uploadedImages.filter(image => !image.id);
    nonUploadedImages.forEach((image: Asset) => {
      formData.append('file', {
        uri: image.uri,
        name: image.fileName,
        type: image.type,
      });
    });

    mutate(formData);
  };

  const hideUploadModal = () => {
    setOpenUpload(false);
  };

  return (
    <>
      <SymptomCheckerWrapper
        onNext={onNext}
        disabled={
          isLoading ||
          isSubmitting ||
          Boolean(uploadedImages?.length && uploadedImages.length > 3)
        }
        isLoading={isLoading || isSubmitting}
        questionId={questionData?.q_id}
        isEdit={params?.isEdit}>
        <View style={styles.container}>
          <SymptomCheckerQuestion data={questionData} />

          <View className="flex-1">
            <SymptomCheckerImageHandler
              images={uploadedImages}
              setImages={setUploadedImages}
              onUploadAnother={() => setOpenUpload(true)}
            />
          </View>
        </View>
      </SymptomCheckerWrapper>

      {/* <SymptomUploadBottomSheet
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onReplace={onReplace}
      /> */}

      <DeleteModal
        visible={openUpload}
        hideAlert={hideUploadModal}
        message={{
          title: languages?.symptom_upload_title,
          content: languages?.symptom_upload_info,
        }}
        handleOk={onReplace}
        handleCancel={hideUploadModal}
      />
    </>
  );
};
export default SymptomCheckerFileUpload;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
});

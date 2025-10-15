import React from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Asset,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import {
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import useLanguageStore from '../../../../../store/languageStore';
import {notifyApi} from '../../../../api/user';
import RoundedButton from '../../../../components/RoundedButton';
import CustomText from '../../../../components/Text';
import {BOLD, REGULAR} from '../../../../constants/Fonts';
import {units} from '../../../../theme';

const SymptomCheckerImageHandler = ({
  setImages,
  images,
  onUploadAnother,
}: {
  setImages: React.Dispatch<
    React.SetStateAction<Asset[] | {id: string; url: string}[]>
  >;
  images: Asset[] | {id: string; url: string}[];
  onUploadAnother: () => void;
}) => {
  const languages = useLanguageStore(store => store.languages);

  const checkCameraPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const requestResult = await request(permission);

    if (requestResult === RESULTS.GRANTED) {
      return true;
    }
    if (requestResult === RESULTS.BLOCKED) {
      Alert.alert(
        languages?.camera_permission_title,
        languages?.camera_permission_description,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => {
              openSettings();
            },
          },
        ],
      );
      return false;
    }

    return false;
  };

  const requestCameraPermission = async () => {
    const hasPermission = await checkCameraPermission();
    notifyApi('camera_permission_granted', hasPermission);
    return hasPermission;
  };

  const onUpload = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 0,
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel || response.errorCode) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setImages(response.assets);
      }
    });
  };

  const onTakePicture = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 0,
    };
    let response = await launchCamera(options);
    if (response.didCancel || response.errorCode) {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        return;
      }

      response = await launchCamera(options);
    }

    if (response.assets && response.assets.length > 0) {
      setImages(prevImages => [...prevImages, ...(response.assets || [])]);
    }
  };

  const onRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  if (images?.length) {
    return (
      <View className="gap-8">
        <View className="flex-row flex-wrap gap-4">
          {images.map((image: any, index) => (
            <View style={styles.imageContainer} key={index.toString()}>
              <View className="w-full h-full overflow-hidden rounded-[20px] border-2 border-[#1671C0]">
                <Image
                  source={{uri: image.id ? image.url : image.uri}}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
              <Pressable
                className="absolute top-1 -right-3 bg-[#F43F5E] h-8 w-8 rounded-full items-center justify-center z-10"
                onPress={() => onRemoveImage(index)}>
                <Feather name="x" size={18} color="#fff" />
              </Pressable>
            </View>
          ))}
          {images?.length && images.length > 3 ? (
            <Text style={styles.validationText}>
              *{languages?.syptom_image_validation}
            </Text>
          ) : null}
        </View>
        <View className="gap-3">
          {/* <Button
            text={languages?.upload_another}
            variant="secondary"
            rightIcon={<Icon name="upload" size={26} color="#1671C0" />}
            onPress={onUploadAnother}
          /> */}
          <TouchableOpacity
            className="border border-gray-300 min-w-[50%] min-h-12 justify-center items-center mt-4 px-4 py-2"
            onPress={onUploadAnother}
            style={{borderRadius: units.scale(100)}}>
            <CustomText className="font-isidoraSemiBold text-lg">
              {languages?.upload_another}
            </CustomText>
          </TouchableOpacity>
          <RoundedButton onPress={() => onTakePicture()}>
            <CustomText className="text-lg text-white font-isidoraSemiBold">
              {languages?.take_photo_now}
            </CustomText>
          </RoundedButton>
          {/* <Button
            text={languages?.take_photo_now}
            variant="secondary"
            rightIcon={<Icon name="camera" size={20} color="#1671C0" />}
            onPress={onTakePicture}
          /> */}
        </View>
      </View>
    );
  }

  return (
    <View>
      <Pressable onPress={onUpload} style={styles.uploadButton}>
        <View style={styles.iconContainer}>
          <Feather name="upload" size={24} color="#1671C0" />
        </View>
        <Text style={styles.uploadText}>{languages?.click_to_upload}</Text>
        <Text style={styles.allowedFileType}>
          {languages?.lab_report_file_type}
        </Text>
      </Pressable>
    </View>
  );
};
export default SymptomCheckerImageHandler;

const styles = StyleSheet.create({
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 32,
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D7EEFC',
    borderRadius: 14,
    marginBottom: 12,
  },
  uploadText: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#222A3D',
    lineHeight: 22,
    marginBottom: 8,
  },
  allowedFileType: {
    fontFamily: REGULAR,
    fontSize: 14,
    color: '#4B5363',
  },
  imageContainer: {
    height: 118,
    width: 115,
    // borderRadius: 20,
    // borderColor: '#1671C0',
    // borderWidth: 2,
    // overflow: 'hidden',
  },
  validationText: {
    fontFamily: REGULAR,
    fontSize: 14,
    color: '#F43F5E',
  },
});

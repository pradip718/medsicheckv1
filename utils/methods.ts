import {EncryptCommand, EncryptCommandInput} from '@aws-sdk/client-kms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Buffer} from 'buffer';
import {PhoneNumberUtil} from 'google-libphonenumber';
import {isEqual, isObject, isString, lowerCase} from 'lodash';
import moment from 'moment';
import {Alert, NativeModules, Platform, Share as RNShare} from 'react-native';
import {CountryCode, CountryCodeList} from 'react-native-country-picker-modal';
import {DocumentPickerResponse} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {Asset} from 'react-native-image-picker';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {isAndroid} from '.';
import {updateLocale} from '../src/api/language';
import {notifyApi} from '../src/api/user';
import {kmsClient} from '../src/config';
import {DEVICE_LOCALE, STORAGE_KEY} from '../src/constants/AsyncStorageKeys';
import {ConfidenceLevels} from '../src/constants/enums';
import {SelectedAnswers} from '../src/screens/auth/Register/Additional_Information/type';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import useLoaderStore from '../store/loaderStore';
import useUserProfileStore from '../store/profileStore';
import {ColorRangeItem, ReadingData} from '../types/jsons';
import {ConfidenceLevelKeys} from '../types/reports';
import {FamilyMembers} from '../types/users/user';
import {successToast} from './toast';

export const getImgBasedOnScore = (score: number) => {
  switch (true) {
    case score === 0:
      return require('../assets/images/CircularProgress/progress_0.png');
    case score === 1:
      return require('../assets/images/CircularProgress/progress_1.png');
    case score === 2:
      return require('../assets/images/CircularProgress/progress_2.png');
    case score === 3:
      return require('../assets/images/CircularProgress/progress_3.png');
    case score === 4:
      return require('../assets/images/CircularProgress/progress_4.png');
    case score === 5:
      return require('../assets/images/CircularProgress/progress_5.png');
    case score === 6:
      return require('../assets/images/CircularProgress/progress_6.png');
    case score === 7:
      return require('../assets/images/CircularProgress/progress_7.png');
    case score === 8:
      return require('../assets/images/CircularProgress/progress_8.png');
    case score === 9:
      return require('../assets/images/CircularProgress/progress_9.png');
    case score === 10:
      return require('../assets/images/CircularProgress/progress_10.png');

    default:
      return '';
  }
};
export const getColorBasedOnWellnessScore = (score: number) => {
  switch (true) {
    case score <= 2:
      return {backgroundColor: 'red', color: 'red'};
    case score <= 4:
      return {backgroundColor: 'orange', color: 'orange'};
    case score <= 6:
      return {backgroundColor: 'yellow', color: 'yellow'};
    case score <= 8:
      return {backgroundColor: 'light green', color: 'light green'};
    case score <= 10:
      return {
        backgroundColor: 'rgba(1, 163, 95, 1)',
        color: 'rgba(1, 163, 95, 1)',
      };

    default:
      return {backgroundColor: 'gray', color: 'gray'};
  }
};

export const getReportCardColorBasedOnWellnessScore = (score: number) => {
  switch (true) {
    case score <= 6:
      return {backgroundColor: 'orange', color: 'orange'};
    case score > 6 && score <= 10:
      return {
        backgroundColor: 'rgba(1, 163, 95, 1)',
        color: 'rgba(1, 163, 95, 1)',
      };

    default:
      return {backgroundColor: 'gray', color: 'gray'};
  }
};

export const getTextBasedOnWellnessScore = (score: number) => {
  switch (true) {
    case score <= 2:
      return {indicator: 'Poor'};
    case score <= 4:
      return {indicator: 'Below Average'};
    case score <= 6:
      return {indicator: 'Average'};
    case score <= 8:
      return {indicator: 'Good'};
    case score <= 10:
      return {indicator: 'Normal'};
    default:
      return {indicator: 'Unknown'};
  }
};

export const getGradientColorBasedOnScore = (score: number): string[] => {
  switch (true) {
    case score <= 2:
      return ['rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 0.6)'];
    case score <= 4:
      return ['rgba(255, 165, 0, 1)', 'rgba(255, 165, 0, 0.6)'];
    case score <= 6:
      return ['rgba(255, 255, 0, 1)', 'rgba(255, 255, 0, 0.6)'];
    case score <= 8:
      return ['rgba(0, 128, 0, 1)', 'rgba(0, 128, 0, 0.6)'];
    case score <= 10:
      return ['rgba(1, 163, 95, 1)', 'rgba(1, 163, 95, 0.6)'];
    default:
      return ['rgba(128, 128, 128, 1)', 'rgba(128, 128, 128, 0.6)'];
  }
};

export const getDeviceLocaleInformation = () => {
  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ??
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
      : NativeModules?.I18nManager?.localeIdentifier;

  return locale?.toLowerCase().replace('_', '-');
};

export const isSpanishLocale = () => {
  return getDeviceLocaleInformation()?.includes('es');
};

export async function updateLocaleInfo() {
  try {
    const locale = await AsyncStorage.getItem(DEVICE_LOCALE);
    if (!useAuthStore.getState().userAuth?.idToken) {
      return locale;
    }
    if (!locale) {
      const deviceLocale = getDeviceLocaleInformation();

      AsyncStorage.setItem(DEVICE_LOCALE, deviceLocale);
      return deviceLocale;
    } else {
      const deviceLocale = getDeviceLocaleInformation();
      if (deviceLocale !== locale) {
        await updateLocale(deviceLocale);
        AsyncStorage.setItem(DEVICE_LOCALE, deviceLocale);
      }
      return deviceLocale;
    }
  } catch (error) {
    throw error;
  }
}

export function wait(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export const convertTitleNameToIcon = (title: string) => {
  const titleArray = title?.split(' ');
  return titleArray?.join('-');
};

export const parseJsonToDropdownItems = (items: string) => {
  try {
    const parsedItems = JSON.parse(items);
    if (parsedItems && Array.isArray(parsedItems)) {
      return parsedItems.map((item: string) => ({label: item, value: item}));
    }
    return [];
  } catch (error) {
    console.log({error});
    return [];
  }
};

export function isValidJSON(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' || Array.isArray(parsed);
  } catch (e) {
    return false;
  }
}

export const getProfileImageFromStorage = async (
  profileId: string,
): Promise<string | Asset> => {
  try {
    const profileStoreData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!profileStoreData) {
      return '';
    }
    const profileInfo = JSON.parse(profileStoreData);
    return profileInfo[profileId];
  } catch (e) {
    console.log({e});
    return '';
  }
};

export function getColorForValue(
  value: number,
  colorRange: ColorRangeItem[],
): string {
  const colorObj = colorRange?.find(item => {
    const [lower, upper] = item.range;
    if (typeof lower === 'number' && typeof upper === 'number') {
      return value >= lower && value <= upper;
    }

    if (item.range?.length === 1 && typeof item.range[0] === 'string') {
      const range = item.range[0];
      let operator: string;
      let rangeValue: number;

      if (range.startsWith('<=') || range.startsWith('>=')) {
        operator = range.substring(0, 2);
        rangeValue = Number(range.substring(2));
      } else {
        operator = range.charAt(0);
        rangeValue = Number(range.substring(1));
      }

      if (operator === '<=' || operator === '<') {
        return value <= rangeValue;
      }
      if (operator === '>=' || operator === '>') {
        return value >= rangeValue;
      }
    }
    return false;
  });

  return colorObj ? colorObj.color : '';
}

export const convertToStringForSingleSelect = (
  currentQuestionAnswers: any,
  answer: string | string[] | {name: string; text: string}[],
): string => {
  if (typeof answer === 'string') {
    return answer;
  }
  if (answer.length === 1) {
    if (typeof answer[0] === 'string') {
      return answer[0] || '';
    }

    return JSON.stringify(answer);
  }
  return JSON.stringify(answer);
};

export const getCorrespondingSpanishAndEnglishAnswer = ({
  selectedAnswer,
  currentQuestionAnswers,
  isEnglish,
}: {
  selectedAnswer: string | string[] | {name: string; text: string}[];
  currentQuestionAnswers: any;
  isEnglish: boolean;
}): string | string[] | {name: string; text: string}[] => {
  if (
    typeof selectedAnswer === 'string' ||
    (Array.isArray(selectedAnswer) && typeof selectedAnswer?.[0] === 'object')
  ) {
    return selectedAnswer;
  }
  const spanishOptions = currentQuestionAnswers?.spanish_choices
    ? JSON.parse(currentQuestionAnswers?.spanish_choices)
    : [];
  const englishOptions = currentQuestionAnswers?.eng_choices
    ? JSON.parse(currentQuestionAnswers?.eng_choices)
    : [];

  if (!englishOptions?.length && !spanishOptions?.length) {
    return selectedAnswer;
  }
  if (isEnglish) {
    return selectedAnswer?.map((selected, _) => {
      const englishIdx = englishOptions.findIndex(
        (english: string) => english === selected,
      );
      return spanishOptions[englishIdx] || '';
    });
  }
  return selectedAnswer.map(selected => {
    const spanishIdx = spanishOptions.findIndex(
      (spanish: string) => spanish === selected,
    );

    return englishOptions[spanishIdx] || '';
  });
};

export const isOnlyAdmin = (members: FamilyMembers[]) => {
  return members.length === 1 && members[0].relation === 'Admin';
};

export const sortAdminToTop = (profiles: FamilyMembers[]) => {
  return profiles.sort((a, b) => {
    if (a.relation === 'Admin' && b.relation !== 'Admin') {
      return -1;
    }
    if (a.relation !== 'Admin' && b.relation === 'Admin') {
      return 1;
    }
    return 0;
  });
};

export const onShare = async (readingData: ReadingData) => {
  try {
    if (!readingData) {
      return;
    }
    let message = '';
    Object.entries(readingData).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        'value' in value &&
        'category' in value
      ) {
        message += `${key}: ${value.value} (${value.category})\n`;
      }
    });
    const result = await RNShare.share({
      message,
    });
    if (result.action === RNShare.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
        notifyApi('share_report', {
          profile_id: useUserProfileStore.getState().currentActiveProfileId,
          action: 'Shared Report',
          activity: result.activityType,
        });
      } else {
        // shared
        notifyApi('share_report', {
          profile_id: useUserProfileStore.getState().currentActiveProfileId,
          action: result.action,
        });
      }
    } else if (result.action === RNShare.dismissedAction) {
      // dismissed
      notifyApi('share_report', {
        profile_id: useUserProfileStore.getState().currentActiveProfileId,
        action: 'Share Dismissed',
      });
    }
  } catch (error: any) {
    Alert.alert(error.message);
  }
};

interface ParsedDiet {
  inputList: string[];
  withoutNestedList: string;
}

export function parseNestedQuestionnaireArray(input: string): ParsedDiet {
  const regex = /\[(.*?)\]/; // Regular expression to find the array part inside the brackets
  const match = input.match(regex); // Match the regular expression with the input string

  let inputList: string[] = [];
  let withoutNestedList = input;

  if (match && match[1]) {
    // If a match is found and it contains the array part
    const arrayString = match[1]; // Extract the array part from the match
    inputList = arrayString.split(',').map(item => item.trim()); // Split the array part by commas and trim any whitespace
    withoutNestedList = input.replace(match[0], '').trim(); // Remove the array part from the input string and trim any leading or trailing whitespace
  }

  return {inputList, withoutNestedList};
}

export const getSelectedStyles = ({
  selectedAnswers,
  questionId,
  nestedItemKey,
  label,
  isSpanish,
}: {
  selectedAnswers: SelectedAnswers;
  questionId: string;
  label: string;
  isSpanish: boolean;
  nestedItemKey?: string;
}) => {
  if (!selectedAnswers) {
    return {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.2)',
    };
  }

  const selectedValues = isSpanish
    ? selectedAnswers.spanish_choice_value
    : selectedAnswers.choice_value;

  const isSelected =
    typeof selectedValues !== 'string'
      ? selectedValues?.some(value => {
          if (typeof value === 'string') {
            return value === label;
          } else if (typeof value === 'object') {
            const key = Object.keys(value)[0];
            if (key === label) {
              return true;
            } else if (Array.isArray(value[key])) {
              return nestedItemKey
                ? key === nestedItemKey && value[key].includes(label)
                : value[key].includes(label);
            }
          }
          return false;
        })
      : false;

  if (isSelected) {
    return {
      backgroundColor: 'rgba(63, 101, 255, 0.41)',
      borderWidth: 1,
      borderColor: 'rgba(63, 101, 255, 0.41)',
    };
  }

  return {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  };
};

const extractFilenameFromURL = (url: string): string => {
  try {
    const decodedURL = decodeURIComponent(url);
    const pathParts = decodedURL.split('/');
    let filename = pathParts.pop() || '';
    filename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');

    return filename;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return '';
  }
};

export const downloadFile = async (report_link: string, name?: string) => {
  useLoaderStore.getState().setVisibility(true);
  const fileName = extractFilenameFromURL(report_link);
  const encodedUrl = encodeURI(report_link);
  const {dirs} = RNFetchBlob.fs;
  await RNFetchBlob.config({
    fileCache: true,
    appendExt: 'pdf',
    path: `${dirs.DocumentDir}/${fileName}`,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      title: fileName || name,
      description: 'File downloaded by download manager.',
      mime: 'application/pdf',
    },
  })
    .fetch('GET', encodedUrl)
    .then(res => {
      if (Platform.OS === 'ios') {
        const filePath = res.path();
        let options = {
          type: 'application/pdf',
          url: filePath,
          saveToFiles: true,
        };
        Share.open(options)
          .then(_ => {
            successToast(
              useLanguageStore.getState().languages.file_download_success,
            );
            useLoaderStore.getState().setVisibility(false);
          })
          .catch(_ => useLoaderStore.getState().setVisibility(false));
      }
    })
    .catch(_ => useLoaderStore.getState().setVisibility(false));

  successToast(useLanguageStore.getState().languages.file_download_success);
};

async function sharePDFWithAndroid(fileUrl: string, type: string) {
  useLoaderStore.getState().setVisibility(true);
  let filePath: any = null;
  const configOptions = {fileCache: true};
  await RNFetchBlob.config(configOptions)
    .fetch('GET', fileUrl)
    .then(resp => {
      filePath = resp.path();
      return resp.readFile('base64');
    })
    .then(async base64Data => {
      base64Data = `data:${type};base64,` + base64Data;
      await Share.open({url: base64Data});
      // remove the image or pdf from device's storage
      await RNFS.unlink(filePath);
      useLoaderStore.getState().setVisibility(false);
    })
    .catch(_ => {
      useLoaderStore.getState().setVisibility(false);
    });
}

async function sharePDFWithIOS(fileUrl: string, type: string) {
  let filePath = null;
  const encodedUrl = encodeURI(fileUrl);
  if (!encodedUrl || !encodedUrl.startsWith('http')) {
    throw new Error('Invalid URL');
  }
  const {dirs} = RNFetchBlob.fs;
  const configOptions = {
    fileCache: true,
    path:
      dirs.DocumentDir +
      (type === 'application/pdf'
        ? `/${extractFilenameFromURL(fileUrl) || 'medsi report'}.pdf`
        : '/SomeFileName.png'),
  };
  RNFetchBlob.config(configOptions)
    .fetch('GET', encodedUrl)
    .then(async resp => {
      console.log('resp', resp);

      filePath = resp.path();
      let options = {
        type: type,
        url: filePath,
        filename: extractFilenameFromURL(fileUrl) || 'medsi report',
      };
      await Share.open(options);
      await RNFS.unlink(filePath);
    });
}

export const onShareFile = async (fileUrl: string, name?: string) => {
  try {
    if (isAndroid) {
      sharePDFWithAndroid(fileUrl, 'application/pdf');
    } else {
      sharePDFWithIOS(fileUrl, 'application/pdf');
    }

    notifyApi('share_report', {
      profile_id: useUserProfileStore.getState().currentActiveProfileId,
      action: {
        name,
        message: 'Shared Report',
      },
    });
  } catch (_) {}
};

export const getConfidenceColor = (level: ConfidenceLevelKeys) => {
  let colors;
  switch (level) {
    case 'Elevado':
    case 'Elevada':
    case 'High':
      colors = [
        ConfidenceLevels.High,
        ConfidenceLevels.High,
        ConfidenceLevels.High,
      ];
      break;
    case 'Promedio':
    case 'Promedia':
    case 'Medium':
      colors = [
        ConfidenceLevels.Medium,
        ConfidenceLevels.Medium,
        ConfidenceLevels.Default,
      ];
      break;
    case 'Bajo':
    case 'Baja':
    case 'Low':
      colors = [
        ConfidenceLevels.Low,
        ConfidenceLevels.Default,
        ConfidenceLevels.Default,
      ];
      break;
    default:
      colors = [
        ConfidenceLevels.Default,
        ConfidenceLevels.Default,
        ConfidenceLevels.Default,
      ];
  }
  return colors;
};

export function getKeyByValue(value: string, list: any) {
  const entries = Object.entries(list);
  for (const [key, val] of entries) {
    if (val === value) {
      return key;
    }
  }
  return null;
}

export const compareOther = (text: string) => {
  const compareText = lowerCase(text);
  return isEqual(compareText, 'other') || isEqual(compareText, 'otro');
};

export const convertDataWithFilesToFormData = <T>(
  payload: T,
  files: DocumentPickerResponse[] | undefined,
): FormData => {
  const formData = new FormData();

  if (payload && isObject(payload)) {
    for (const [key, value] of Object.entries(payload)) {
      formData.append(
        key,
        isString(value) ? value : JSON.stringify(value) ?? '',
      );
    }
  }

  if (files) {
    files.forEach(file => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });
  }

  return formData;
};

export const extractQueryParams = (url: string): Record<string, string> => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params: Record<string, string> = {};
  let match;

  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
    console.log(match[1], match[2]);
  }

  return params;
};

export async function encryptText(text: string) {
  const cred = useAuthStore.getState()?.awsCred;

  const params: EncryptCommandInput = {
    KeyId: cred?.kms_arn,
    Plaintext: Buffer.from(text),
    EncryptionAlgorithm: cred?.kms_algorithm,
  };

  try {
    const command = new EncryptCommand(params);
    const response = await kmsClient.send(command);

    if (!response.CiphertextBlob) {
      throw new Error('Encryption failed: CiphertextBlob is undefined');
    }

    return Buffer.from(response.CiphertextBlob).toString('base64');
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw error;
  }
}

const phoneUtil = PhoneNumberUtil.getInstance();

function isCountryCode(code: string): code is CountryCode {
  return CountryCodeList.includes(code as CountryCode);
}

export const parsePhoneNumber = (
  phoneNumber: string,
): {countryCode: string; nationalNumber: string; regionCode: CountryCode} => {
  try {
    if (!phoneNumber) {
      return {
        countryCode: '',
        nationalNumber: '',
        regionCode: 'MX',
      };
    }
    const parsedNo = phoneUtil.parse(phoneNumber, '');
    const nationalNumber = parsedNo?.getNationalNumber()?.toString() ?? '';
    const countryCode = parsedNo?.getCountryCode()?.toString() ?? '+52';
    const regionCode = phoneUtil.getRegionCodeForNumber(parsedNo) ?? 'MX';

    const isValidRegionCode = isCountryCode(regionCode);

    return {
      countryCode,
      nationalNumber,
      regionCode: isValidRegionCode ? regionCode : 'MX',
    };
  } catch (error) {
    // console.error('Error parsing phone number:', error);
    return {
      countryCode: '',
      nationalNumber: '',
      regionCode: 'MX',
    };
  }
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  try {
    const parsedNo = phoneUtil.parse(phoneNumber, '');
    const isValidNumber = phoneUtil.isValidNumber(parsedNo);
    const isValidLength = phoneUtil.isPossibleNumber(parsedNo);

    return isValidNumber && isValidLength;
  } catch (error) {
    // console.error('Invalid phone number:', error);
    return false;
  }
};

export function convertFeetAndInchesToCm(
  height: number,
  height_unit: 'cm' | 'in' | 'feet',
): number | undefined {
  if (height_unit === 'feet' || height_unit === 'in') {
    const feet = Math.floor(height);
    const inches = (height - feet) * 12;
    const cm = feet * 30.48 + inches * 2.54;
    return cm >= 130 && cm <= 230 ? cm : undefined;
  }
  return height >= 130 && height <= 230 ? height : undefined;
}

export function convertWeightToKg(
  weight: number,
  weight_unit: 'kg' | 'lbs',
): number | undefined {
  if (weight_unit === 'lbs') {
    const kg = weight * 0.453592;
    return kg >= 40 && kg <= 200 ? kg : undefined;
  }
  return weight >= 40 && weight <= 200 ? weight : undefined;
}

export function getAgeFromBirthdate(
  birthdate: string,
  format: string = 'DD/MM/YYYY',
): number | undefined {
  const age = Number(moment().diff(moment(birthdate, format), 'years'));
  return age >= 18 && age <= 110 ? age : undefined;
}
export const formatTimes = (
  utcStart: string,
  utcEnd: string | undefined | null = null,
) => {
  const format = 'h:mm A, MMM D';

  if (!utcStart && !utcEnd) {
    return {
      utcFormatted: '',
      localFormatted: '',
    };
  }

  const startUtc = moment.utc(utcStart).format(format);
  const startLocal = moment(utcStart).local().format(format);

  if (!utcEnd) {
    return {
      utcFormatted: `${startUtc}`,
      localFormatted: `${startLocal}`,
    };
  }

  const endUtc = moment.utc(utcEnd).format(format);
  const endLocal = moment(utcEnd).local().format(format);

  return {
    utcFormatted: `${startUtc} to ${endUtc}`,
    localFormatted: `${startLocal} to ${endLocal}`,
  };
};

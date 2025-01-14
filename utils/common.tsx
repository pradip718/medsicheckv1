/* eslint-disable react-native/no-inline-styles */
import {StackActions} from '@react-navigation/native';
import React from 'react';
import {Linking} from 'react-native';
import {BaseToast, ErrorToast} from 'react-native-toast-message';
import {navigationRef} from '../RootNavigation';
import {getSessionToken} from '../src/api/auth';
import {syncScanSession} from '../src/api/report';
import CustomText from '../src/components/Text';
import {DEEPLINK_CONFIG} from '../src/constants';
import useAppStore from '../store/appStore';
import useAuthStore from '../store/authStore';
import useUserProfileStore from '../store/profileStore';
import {extractQueryParams} from './methods';

export const ParseAndRenderText = (text: string) => {
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /<b>(.*?)<\/b>/g;
  const linkRegex = /<link>(.*?)<\/link>/g;
  // const commentRegex = /<comment>(.*?)<\/comment>/g;
  const commentRegex = /<comment>([\s\S]*?)<\/comment>/g;

  // Process the text for bold and link tags
  text.replace(
    boldRegex,
    (match: string, content: string, index: number): string => {
      parts.push(
        <CustomText
          key={parts.length}
          className="text-black font-isidoraSemiBold">
          {text.substring(lastIndex, index)}
        </CustomText>,
      );
      parts.push(
        <CustomText
          key={parts.length}
          className="text-black font-isidoraSemiBold"
          style={match.startsWith('<b>') ? {fontWeight: 'bold'} : {}}>
          {content}
        </CustomText>,
      );
      lastIndex = index + match.length;
      return '';
    },
  );

  text.replace(
    linkRegex,
    (match: string, url: string, index: number): string => {
      parts.push(
        <CustomText
          key={parts.length}
          className="text-black font-isidoraSemiBold">
          {text.substring(lastIndex, index)}
        </CustomText>,
      );
      parts.push(
        <CustomText
          key={parts.length}
          className="font-isidoraSemiBold text-ultramarineBlue underline"
          onPress={() => Linking.openURL(url)}>
          {url}
        </CustomText>,
      );
      lastIndex = index + match.length;
      return '';
    },
  );

  text.replace(
    commentRegex,
    (match: string, comment: string, index: number): string => {
      parts.push(
        <CustomText
          key={parts.length}
          className="text-black font-isidoraSemiBold">
          {text.substring(lastIndex, index)}
        </CustomText>,
      );
      parts.push(
        <CustomText
          key={parts.length}
          className="font-isidoraRegular text-lightGrey text-sm">
          {'\n'}
          {comment}
        </CustomText>,
      );
      lastIndex = index + match.length;
      return '';
    },
  );

  parts.push(
    <CustomText key={parts.length} className="text-black font-isidoraSemiBold">
      {text.substring(lastIndex)}
    </CustomText>,
  );

  return parts;
};

export const redirectFromDeeplink = async (url: string) => {
  if (url) {
    const {session_id, profile_id} = extractQueryParams(url);

    const {token} = await getSessionToken({session_id, profile_id});

    if (!token) {
      return '';
    }
    const path = url?.split('?')[0]?.split('/').pop();

    if (path === 'face_scan') {
      useAuthStore.getState().setDeeplinkAuth({
        session_id: session_id || '',
        token: token || '',
      });
      useAppStore.getState().setIsFaceScanDeeplink(true);

      useUserProfileStore
        .getState()
        .setCurrentActiveProfileId(profile_id || '');
      syncScanSession('deeplink_opened');
      if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace('QRFaceScan'));
      }
      return 'medsicheck://face_scan';
    }
    if (
      path &&
      DEEPLINK_CONFIG[path] &&
      useAuthStore.getState()?.userAuth?.idToken
    ) {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(DEEPLINK_CONFIG[path]));
      }
      return `medsicheck://${path}`;
    }
    console.warn(`Unknown path: ${path}`);
    return '';
  }
  return '';
};

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      text1Style={{
        fontSize: 15,
        fontFamily: 'IsidoraSans-Regular',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'IsidoraSans-Regular',
      }}
      text1NumberOfLines={10}
      text2NumberOfLines={10}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 14,
        fontFamily: 'IsidoraSans-Regular',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'IsidoraSans-Regular',
      }}
      text1NumberOfLines={10}
      text2NumberOfLines={10}
    />
  ),
};

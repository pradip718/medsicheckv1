import {KMSClient} from '@aws-sdk/client-kms';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {ReadableStream} from 'web-streams-polyfill';
import useAuthStore from '../../store/authStore';

declare global {
  var ReadableStream: any;
}

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}

export const kmsClient = new KMSClient({
  region: 'mx-central-1',
  credentials: {
    accessKeyId: useAuthStore.getState().awsCred?.access_key ?? '',
    secretAccessKey: useAuthStore.getState().awsCred?.secret_access_key ?? '',
  },
});

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {ReadableStream} from 'web-streams-polyfill';

declare global {
  var ReadableStream: any;
}

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}

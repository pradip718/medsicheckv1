/**
 * @format
 */

import {AppRegistry} from 'react-native';
// import {
//   Text as RNPaperText,
//   TextInput as RNPaperTextInput,
// } from 'react-native-paper';

import App from './App';
import {name as appName} from './app.json';

import {Mutex} from 'async-mutex';

export const sessionMutex = new Mutex();

if (__DEV__) {
  require('./ReactotronConfig');
}

// Text.defaultProps = Text.defaultProps || {};
// Text.defaultProps.allowFontScaling = false;

// RNPaperText.defaultProps = RNPaperText.defaultProps || {};
// RNPaperText.defaultProps.allowFontScaling = false;

// TextInput.defaultProps = TextInput.defaultProps || {};
// TextInput.defaultProps.allowFontScaling = false;

// RNPaperTextInput.defaultProps = RNPaperTextInput.defaultProps || {};
// RNPaperTextInput.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => App);

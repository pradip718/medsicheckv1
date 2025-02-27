import {NativeModules} from 'react-native';
import Config from 'react-native-config';
import reactotronZustand from 'reactotron-plugin-zustand';
import Reactotron, {networking} from 'reactotron-react-native';
import useBinahConfigStore from './store/binahConfigStore';
import useHealthRiskStore from './store/healthRisksStore';

// let scriptHostname;
// if (__DEV__) {
//   const scriptURL = NativeModules.SourceCode.scriptURL;
//   scriptHostname = scriptURL.split('://')[1].split(':')[0];
// }

Reactotron.configure({
  name: Config.Environment,
  // host: scriptHostname,
})
  .useReactNative()
  .use(networking())
  .use(
    reactotronZustand({
      stores: [
        {name: 'binah', store: useBinahConfigStore},
        {name: 'health_risk', store: useHealthRiskStore},
      ],
      omitFunctionKeys: true,
    }),
  )
  .connect();

Reactotron.onCustomCommand({
  title: 'Go Back',
  description: 'Goes back',
  command: 'goBack',
  handler: () => {
    Reactotron.log('Going back');
  },
});

Reactotron.onCustomCommand({
  title: 'Show Dev Menu',
  description: 'Opens the React Native dev menu',
  command: 'showDevMenu',
  handler: () => {
    Reactotron.log('Showing React Native dev menu');
    NativeModules.DevMenu.show();
  },
});

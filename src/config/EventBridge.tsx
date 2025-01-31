/*
 *              Copyright (c) 2016-2023, Nuralogix Corp.
 *                      All Rights reserved
 *
 *      THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
 *      PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
 *      PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
 *      AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
 *      PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
 *      OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
 *      DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
 *      EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
 *      NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
 */

import {useEffect, useRef} from 'react';
import {LogBox, NativeEventEmitter, NativeModules} from 'react-native';
// import useLoaderStore from '../../store/loaderStore.js';
import useFullPageLoader from '../hooks/useFullPageLoader';
import Action from './Action.js';
import Event from './Event.js';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const NativeBridge = NativeModules.RNTEventBridge;
const NativeModule = new NativeEventEmitter(NativeBridge);

const useEventBridge = () => {
  const isAddedCommonListener = useRef(false);
  const isAddedResultsListener = useRef(false);
  const {hideLoader} = useFullPageLoader();

  const sendEvent = (name: string, body: any) => {
    NativeBridge.doSomething(name, JSON.stringify(body));
  };

  const addCommonListener = (
    commonCallback: (name: String, data: any) => void,
  ) => {
    if (!isAddedCommonListener.current) {
      NativeBridge.anura_startCommonObserving();
      console.log('rn--js...addCommonListener');
      isAddedCommonListener.current = true;
      NativeModule.addListener(Action.reminderCommon, data => {
        const actionName = data.nativeActionName;
        if (actionName == Action.stopCommonObserving) {
          removeCommonListener();
        } else {
          commonCallback(actionName, data.data);
        }
        parseActionsFromNative(actionName, data.data);
      });
    }
  };

  const addResultsListener = (
    resultsCallback: (name: String, data: any) => void,
  ) => {
    if (!isAddedResultsListener.current) {
      NativeBridge.anura_startResultsObserving();
      console.log('rn--js...addResultsListener');
      isAddedResultsListener.current = true;
      NativeModule.addListener(Action.reminderResults, data => {
        const actionName = data.nativeActionName;
        if (actionName == Action.stopResultsObserving) {
          removeResultsListener();
        } else {
          resultsCallback(actionName, data.data);
        }
        parseActionsFromNative(actionName, data.data);
      });
    }
  };

  const parseActionsFromNative = (name: String, data: any) => {
    if (name == Event.anuraMeasurementPageDidLoad) {
      console.log('rn--js...anuraMeasurementPageDidLoad');
    } else if (name == Event.anuraMeasurementPageDidAppear) {
      hideLoader();
      console.log('rn--js...anuraMeasurementPageDidAppear');
    } else if (name == Event.anuraMeasurementPageDidDisappear) {
      console.log('rn--js...anuraMeasurementPageDidDisappear');
    } else if (name == Event.anuraMeasurementPageIsReadyToMeasure) {
      console.log('rn--js...anuraMeasurementPageIsReadyToMeasure');
    } else if (name == Event.anuraMeasurementPageDidStartMeasuring) {
      console.log('rn--js...anuraMeasurementPageDidStartMeasuring');
    } else if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
      console.log('rn--js...anuraMeasurementPageDidFinishMeasuring');
    } else if (name == Event.anuraMeasurementGetResultsSuccess) {
      console.log(
        `rn--js...anuraMeasurementGetResultsSuccess, results:${JSON.stringify(
          data,
        )}`,
      );
    } else if (name == Event.anuraMeasurementGetResultsFailure) {
      console.log(
        `rn--js...anuraMeasurementGetResultsFailure, errorCode:${data.errorCode}, errorDescription:${data.errorDescription}`,
      );
    } else {
      console.log(`rn--js...other, name: ${name}`);
    }
  };

  const removeCommonListener = () => {
    console.log('rn--js...removeCommonListener');
    isAddedCommonListener.current = false;
    NativeModule.removeAllListeners(Action.reminderCommon);
  };

  const removeResultsListener = () => {
    console.log('rn--js...removeResultsListener');
    isAddedResultsListener.current = false;
    NativeModule.removeAllListeners(Action.reminderResults);
  };

  useEffect(() => {
    return () => {
      removeCommonListener();
      removeResultsListener();
    };
  }, []);

  return {
    sendEvent,
    addCommonListener,
    addResultsListener,
    removeCommonListener,
    removeResultsListener,
  };
};

export default useEventBridge;

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

import { NativeEventEmitter, NativeModules } from 'react-native';
import { LogBox } from 'react-native';
import Action from './Action.js'
import Event from './Event.js';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const NativeBridge = NativeModules.RNTEventBridge;
const NativeModule = new NativeEventEmitter(NativeBridge)

export default class EventBridge {
    static isAddedCommonLisener: boolean = false;
    static isAddedResultsLisener: boolean = false;

    static sendEvent(name: string, body: any) {
        NativeBridge.doSomething(name, JSON.stringify(body))
    }

    static addCommonListener(commonCallback: ((name: String, data: any) => void)) {
        if (!EventBridge.isAddedCommonLisener) {
            NativeBridge.anura_startCommonObserving();
            console.log('rn--js...addCommonListener')
            EventBridge.isAddedCommonLisener = true
            NativeModule.addListener(Action.reminderCommon, (data) => {
                const actionName = data.nativeActionName;
                if (actionName == Action.stopCommonObserving) {
                    this.removeCommonListener()
                } else {
                    commonCallback(actionName, data.data)
                }
                this.parseActionsFromNative(actionName, data.data)
            })
        }
    }

    static addReusltsListener(resultsCallback: ((name: String, data: any) => void)) {
        if (!EventBridge.isAddedResultsLisener) {
            NativeBridge.anura_startResultsObserving();
            console.log('rn--js...addReusltsListener')
            EventBridge.isAddedResultsLisener = true
            NativeModule.addListener(Action.reminderResults, (data) => {
                var actionName = data.nativeActionName;
                if (actionName == Action.stopResultsObserving) {
                    this.removeResultsListener()
                } else {
                    resultsCallback(actionName, data.data)
                }
                this.parseActionsFromNative(actionName, data.data)
            })
        }
    }

    static parseActionsFromNative(name: String, data: any) {
        if (name == Event.anuraMeasurementPageDidLoad) {
            // Called when the Anura Measurement page has finished loading
            console.log('rn--js...anuraMeasurementPageDidLoad')
        } else if (name == Event.anuraMeasurementPageDidAppear) {
            // Called when the measurement page appears on the screen
            console.log('rn--js...anuraMeasurementPageDidAppear')
        } else if (name == Event.anuraMeasurementPageDidDisappear) {
            // Called when the measurement page disappears from the screen
            console.log('rn--js...anuraMeasurementPageDidDisappear')
        } else if (name == Event.anuraMeasurementPageIsReadyToMeasure) {
            // Called when the camera is calibrated and ready to measure
            console.log('rn--js...anuraMeasurementPageIsReadyToMeasure')
        } else if (name == Event.anuraMeasurementPageDidStartMeasuring) {
            // Called when countdown has finished and Anura is about to start the measurement
            console.log('rn--js...anuraMeasurementPageDidStartMeasuring')
        } else if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
            // Called when the measurement is complete
            console.log('rn--js...anuraMeasurementPageDidFinishMeasuring')
        } else if (name == Event.anuraMeasurementGetResultsSuccess) {
            // Called when reveiving the measurement results
            console.log(`rn--js...anuraMeasurementGetResultsSuccess, results:${JSON.stringify(data)}`)
        } else if (name == Event.anuraMeasurementGetResultsFailure) {
            // Called when the measurement results fails to be received
            console.log(`rn--js...anuraMeasurementGetResultsFailure, errorCode:${data.errorCode}, errorDescription:${data.errorDescription}`)
        } else {
            console.log(`rn--js...other, name: ${name}`)
        }
    }

    static removeCommonListener() {
        console.log('rn--js...removeCommonListener')
        EventBridge.isAddedCommonLisener = false
        NativeModule.removeAllListeners(Action.reminderCommon)
    }

    static removeResultsListener() {
        console.log('rn--js...removeResultsListener')
        EventBridge.isAddedResultsLisener = false
        NativeModule.removeAllListeners(Action.reminderResults)
    }
}

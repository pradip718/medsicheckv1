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

import React, {useState} from 'react';
import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
import Action from '../../config/Action';
import Event from '../../config/Event';
import EventBridge from '../../config/EventBridge';

const ResultsPage = ({navigation}) => {
  const [resultsData, setResultsData] = useState({});
  const [isLoadingDisplay, setIsLoadingDisplay] = useState('');
  const [isListDisplay, setIsListDisplay] = useState('none');
  const [isErrorDisplay, setIsErrorDisplay] = useState('none');
  const [errorDescription, setErrorDescription] = useState('');

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button onPress={() => measurementDone()} title="Done" />
      ),

      headerRight: () => (
        <Button onPress={() => measurementAgain()} title="Again" />
      ),
    });
  }, [resultsData]);

  React.useEffect(() => {
    addReusltsListener();
  }, []);

  const measurementDone = () => {
    if (resultsData.results == null) {
      EventBridge.removeResultsListener();
    }
    navigation.goBack();
  };

  const measurementAgain = () => {
    if (resultsData.results == null) {
      EventBridge.removeResultsListener();
    }

    EventBridge.sendEvent(Action.startMeasurement);
    EventBridge.addCommonListener(name => {
      if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
        setResultsData({});
        setIsLoadingDisplay('');
        setIsListDisplay('none');
        setIsErrorDisplay('none');
        setErrorDescription('');
        addReusltsListener();
      }
    });
  };

  const addReusltsListener = () => {
    EventBridge.addReusltsListener((name, data) => {
      setIsLoadingDisplay('none');
      clearInterval(timer);
      if (name == Event.anuraMeasurementGetResultsSuccess) {
        setResultsData(data);
        setIsListDisplay('');
        setIsErrorDisplay('none');
      } else {
        setIsListDisplay('none');
        setIsErrorDisplay('');
        setErrorDescription(
          `measurement failure! (reason: ${data.errorDescription})`,
        );
      }
    });

    const timer = setTimeout(() => {
      if (resultsData.results == null) {
        EventBridge.removeResultsListener();
        setIsLoadingDisplay('none');
        setIsListDisplay('none');
        setIsErrorDisplay('');
        setErrorDescription('measurement timeout!');
      }
    }, 30000);
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'column',
        },
      ]}>
      <View style={[styles.loading, {display: isLoadingDisplay}]}>
        <Text>loading...</Text>
      </View>

      <View style={[styles.error_view, {display: isErrorDisplay}]}>
        <Text>{errorDescription}</Text>
      </View>

      <View style={[styles.list_container, {display: isListDisplay}]}>
        <FlatList
          data={resultsData.results}
          renderItem={({item}) => (
            <View style={styles.list_view}>
              <Text style={styles.list_title}>{item.key}</Text>
              <Text style={styles.list_subTitle}>{item.value}</Text>
            </View>
          )}
          ItemSeparatorComponent={
            <View style={{height: 1, backgroundColor: 'lightgray'}} />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.id}>ID: {resultsData.measurementID}</Text>
          }
        />
      </View>
    </View>
  );
};

export default ResultsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  id: {
    flex: 1,
    textAlign: 'center',
    height: 40,
    paddingVertical: 10,
  },

  loading: {
    flex: 20,
    textAlign: 'center',
    justifyContent: 'center',
  },

  error_view: {
    flex: 20,
    textAlign: 'center',
    justifyContent: 'center',
  },

  list_container: {
    flex: 20,
    width: '100%',
  },

  list_view: {
    height: 60,
    justifyContent: 'center',
  },

  list_title: {
    fontSize: 18,
    height: 25,
  },

  list_subTitle: {
    fontSize: 12,
    height: 20,
  },
});

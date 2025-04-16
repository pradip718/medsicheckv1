import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ScanCard from './components/ScanCard';
import VoiceScanCard from './components/VoiceScanCard';
import WelcomeCard from './components/WelcomeCard';

const NewUser = () => {
  return (
    <ScrollView style={styles.container}>
      <WelcomeCard />
      <ScanCard />
      <VoiceScanCard />
    </ScrollView>
  );
};

export default NewUser;

const styles = StyleSheet.create({
  container: {},
});

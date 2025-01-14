import React from 'react';
import {StyleSheet, View} from 'react-native';
import ScanCard from './components/ScanCard';
import WelcomeCard from './components/WelcomeCard';

const NewUser = () => {
  return (
    <View style={styles.container}>
      <WelcomeCard />
      <ScanCard />
    </View>
  );
};

export default NewUser;

const styles = StyleSheet.create({
  container: {},
});

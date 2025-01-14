import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {PreventixNavLogo} from '../../../../assets';

const Navbar = () => {
  return (
    <View className="items-center" style={styles.container}>
      <Image
        source={PreventixNavLogo as any}
        className="w-full"
        resizeMode="contain"
      />
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  container: {},
});

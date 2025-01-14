import {BlurView} from '@react-native-community/blur';
import {AnimatePresence, ScrollView, View} from 'moti';
import React, {PropsWithChildren} from 'react';
import {ImageBackground, Pressable, StyleSheet} from 'react-native';
import Background from '../../../assets/images/background.png';
import Metrics, {screenHeight} from '../../../utils';

interface BottomAlertProps {
  visible: boolean;
  hideModal: () => void;
  hasBackgroundImage?: boolean;
}

const RenderChildren = ({children}: any) => (
  <View className="p-4">{children}</View>
);

const BottomAlert = ({
  visible,
  hideModal,
  children,
  hasBackgroundImage = false,
}: PropsWithChildren<BottomAlertProps>) => {
  return (
    <AnimatePresence>
      {visible && (
        <View className="absolute w-full h-full" style={styles.absolute}>
          <Pressable className="w-full flex-grow" onPress={hideModal}>
            <BlurView
              style={styles.absolute}
              blurType="dark"
              blurAmount={1}
              reducedTransparencyFallbackColor="white"
            />
          </Pressable>

          <View className="max-h-[60%]">
            <ScrollView
              from={{translateY: 200}}
              animate={{translateY: 0}}
              exit={{translateY: screenHeight}}
              transition={{type: 'timing', duration: 500} as any}
              className="w-full"
              bounces={false}>
              <View className="w-full rounded-t-3xl overflow-hidden">
                {hasBackgroundImage ? (
                  <ImageBackground
                    source={Background as any}
                    resizeMode="stretch">
                    <RenderChildren>{children}</RenderChildren>
                  </ImageBackground>
                ) : (
                  <View className="bg-white">
                    <RenderChildren>{children}</RenderChildren>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </AnimatePresence>
  );
};

export default BottomAlert;

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: -Metrics.screenHeight,
    right: 0,
  },
});

import React, {useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ColorValue,
  type ViewStyle,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
// import useLanguageStore from '../../../store/languageStore';
// import CustomText from '../Text';
interface LoaderProps {
  name: '6-dots' | '2-curves';
  color?: ColorValue;
}
const height = 50;

type FullPageLoaderProps = {
  visible: boolean;
  hideModal?: () => void;
};

const FullScreenLoader = ({visible}: FullPageLoaderProps) => {
  // const {languages} = useLanguageStore();
  return (
    <Portal>
      <Modal
        visible={visible}
        contentContainerStyle={styles.containerStyle}
        dismissable={false}>
        <Loader name="6-dots" color={'#007AFF'} />
        {/* <CustomText className="font-isidoraBold text-lg text-white">
          {languages?.loading}
        </CustomText> */}
        {/* <View className="bg-white px-10 py-10 rounded-2xl">
          <ActivityIndicator size="large" color={customColor.ultramarineBlue} />
          <CustomText className="mt-4  font-isidoraSemiBold text-sm">
            {languages?.loading}
          </CustomText>
        </View> */}
      </Modal>
    </Portal>
  );
};

export default FullScreenLoader;

const Loader: React.FC<LoaderProps> = ({name, color}) => {
  const firstCircle = useRef(new Animated.Value(0)).current;
  const secondCircle = useRef(new Animated.Value(0)).current;
  const thirdCircle = useRef(new Animated.Value(0)).current;
  const fourthCircle = useRef(new Animated.Value(0)).current;
  const fifthCircle = useRef(new Animated.Value(0)).current;
  const sixthCircle = useRef(new Animated.Value(0)).current;
  let containerStyle: ViewStyle = {};
  let backgroundStyle: ViewStyle = {};
  let loaderStyle: ViewStyle = {};

  let dotOneStyle: ViewStyle = {};
  let dotTwoStyle: ViewStyle = {};
  let dotThreeStyle: ViewStyle = {};
  let dotFourStyle: ViewStyle = {};
  let dotFiveStyle: ViewStyle = {};
  let dotSixStyle: ViewStyle = {};
  let dotSevenStyle: ViewStyle = {};
  const rotation = useRef(new Animated.Value(0)).current;
  dotOneStyle = {
    ...dotOneStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotTwoStyle = {
    ...dotTwoStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotThreeStyle = {
    ...dotThreeStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotFourStyle = {
    ...dotFourStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotFiveStyle = {
    ...dotFiveStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotSixStyle = {
    ...dotSixStyle,
    width: 10,
    height: 10,
    backgroundColor: color ? color : 'dodgerblue',
    borderRadius: 6,
  };
  dotSevenStyle = {
    ...dotSevenStyle,
    width: 10,
    height: 10,
    backgroundColor: 'transparent',
    borderRadius: 6,
  };
  switch (name) {
    case '6-dots':
      containerStyle = {
        ...containerStyle,
        width: 100,
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      };

      Animated.loop(
        Animated.parallel([
          Animated.timing(firstCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(secondCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(thirdCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fourthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fifthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(sixthCircle, {
            toValue: 120,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      break;
    case '2-curves':
      containerStyle = {
        ...containerStyle,
        height: 48,
        width: 48,
      };
      backgroundStyle = {
        ...backgroundStyle,
        height: '100%',
        width: '100%',
        borderRadius: height,
        backgroundColor: 'transparent',
      };
      loaderStyle = {
        ...loaderStyle,
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderRadius: height,
        borderWidth: 5,
        backgroundColor: 'transparent',
        borderTopColor: color ? color : 'dodgerblue',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color ? color : 'dodgerblue',
      };
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotation, {
            toValue: 360,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      break;
    default:
      break;
  }
  if (name == '2-curves') {
    return (
      <View style={[containerStyle]}>
        <View style={[backgroundStyle]}></View>
        <Animated.View
          style={[
            loaderStyle,
            {
              transform: [
                {
                  rotateZ: rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}></Animated.View>
      </View>
    );
  } else if (name == '6-dots') {
    return (
      <View style={[containerStyle]}>
        <Animated.View
          style={[
            dotOneStyle,
            {
              transform: [
                {
                  translateX: firstCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [
                      0, 15, 30, 45, 60, 75, 90, 75, 60, 45, 30, 15, 0,
                    ],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <Animated.View
          style={[
            dotTwoStyle,
            {
              transform: [
                {
                  translateY: secondCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <Animated.View
          style={[
            dotThreeStyle,
            {
              transform: [
                {
                  translateY: thirdCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <Animated.View
          style={[
            dotFourStyle,
            {
              transform: [
                {
                  translateY: fourthCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [0, 0, 0, -15, 0, 0, 0, 0, 0, 15, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <Animated.View
          style={[
            dotFiveStyle,
            {
              transform: [
                {
                  translateY: fifthCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [0, 0, 0, 0, -15, 0, 0, 0, 15, 0, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <Animated.View
          style={[
            dotSixStyle,
            {
              transform: [
                {
                  translateY: sixthCircle.interpolate({
                    inputRange: [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                    ],
                    outputRange: [0, 0, 0, 0, 0, -15, 0, 15, 0, 0, 0, 0, 0],
                  }),
                },
              ],
            },
          ]}></Animated.View>
        <View style={[dotSevenStyle, {}]}></View>
      </View>
    );
  } else {
    return <></>;
  }
};

const styles = StyleSheet.create({
  containerStyle: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

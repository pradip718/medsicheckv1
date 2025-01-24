import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {SafeAreaView} from 'moti';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
// import Carousel, {Pagination} from 'react-native-snap-carousel';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import Metrics from '../../../utils';
import {
  convertFeetAndInchesToCm,
  convertWeightToKg,
  getAgeFromBirthdate,
  getGenderForDemoGraphic,
  hasValidUserDemographics,
} from '../../../utils/methods';
import BackgroundImage from '../../components/BackgroundImage';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import Action from '../../config/Action';
import AppConfig from '../../config/AppConfig';
import Event from '../../config/Event';
import EventBridge from '../../config/EventBridge';
import useAppConfig from '../../hooks/api/useAppConfig';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import Header from './Header';
import {ENTRIES1} from './data';

const TOTAL_SLIDE = 4;

type RenderCarouselProps = {
  onChangeSlide: (index: number) => void;
  activeSlide: number;
};

// const RenderCarousel = React.forwardRef(
//   ({activeSlide, onChangeSlide}: RenderCarouselProps, ref) => {
//     const {evaluateSize} = useAppConfig();

//     const _renderItem = ({item}: any) => {
//       return (
//         <EtchedGlass
//           // className="h-[280] mediumPhone:min-h-[407] tablet:h-[80%] justify-center"
//           containerStyle={styles.contentContainer}>
//           <ScrollView
//             className="max-h-full"
//             showsVerticalScrollIndicator={false}>
//             <View className="items-center">
//               <Image
//                 source={item.illustration as any}
//                 style={[
//                   styles.carouselImg,
//                   {height: evaluateSize('vertical', 218)},
//                 ]}
//               />
//             </View>

//             <CustomText className="mt-10 text-center text-xs mediumPhone:text-sm largePhone:text-base">
//               {item.subtitle}
//             </CustomText>
//           </ScrollView>
//         </EtchedGlass>
//       );
//     };

//     return (
//       <View className="justify-center">
//         <Carousel
//           //@ts-ignore
//           ref={ref}
//           // ref={(c) => { this._carousel = c; }}
//           data={ENTRIES1}
//           renderItem={_renderItem}
//           sliderWidth={Metrics.screenWidth}
//           itemWidth={evaluateSize('scale', 312)}
//           // pagingEnabled
//           onSnapToItem={onChangeSlide}
//         />

//         <View className="my-4">
//           <Pagination
//             containerStyle={styles.paginationContentContainer}
//             dotsLength={ENTRIES1.length}
//             activeDotIndex={activeSlide}
//             dotStyle={styles.dotStyle}
//             inactiveDotStyle={
//               {
//                 // Define styles for inactive dots here
//               }
//             }
//             inactiveDotOpacity={0.4}
//             inactiveDotScale={0.6}
//           />
//         </View>
//       </View>
//     );
//   },
// );

const FaceScan = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const carouselRef = useRef<Carousel<{}>>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [doNotShowChecked, setDoNotShowChecked] = useState<boolean>(false);

  const {data: users} = useGetUserAttributes();

  const isLastSlide = activeSlide >= TOTAL_SLIDE - 1;

  //cleanup carousel state
  useFocusEffect(
    useCallback(() => {
      return () => {
        carouselRef?.current?.snapToItem(0);
      };
    }, []),
  );

  const onDoNotShowChecked = async (check: boolean) => {
    setDoNotShowChecked(check);
  };

  const onChangeActiveSlide = (index: number) => {
    setActiveSlide(index);
  };

  const onChangeCarouselSlide = () => {
    if (carouselRef?.current) {
      carouselRef?.current?.snapToNext();
    }
  };

  const navigateToFaceScanCamera = () => {
    navigation.navigate('FaceScanCamera');
  };

  useEffect(() => {
    EventBridge.sendEvent(Action.synchronizeAppConfiguration, AppConfig);
  }, []);

  return (
    <BackgroundImage>
      <SafeAreaView className="h-full">
        <View className="px-4 py-2 mediumPhone:py-4">
          <Navbar hasClose noBack />
        </View>
        <View
          className="mt-10 h-[89px] smallPhone:mt-0"
          style={styles.headerContainer}>
          <Header
            doNotShowChecked={doNotShowChecked}
            onDoNotShowChecked={onDoNotShowChecked}
          />
        </View>

        <View className="justify-end flex-grow">
          <View className="px-10 mb-2">
            <RoundedButton
              // onPress={
              //   isLastSlide ? navigateToFaceScanCamera : onChangeCarouselSlide
              // }
              onPress={navigateToFaceScanCamera}>
              <CustomText className="text-white text-xl font-isidoraSemiBold">
                {/* {isLastSlide
                ? languages?.start_button_text
                : languages?.next_button_txt} */}
                Binah
              </CustomText>
            </RoundedButton>
          </View>
          <View className="px-10 mb-2">
            <RoundedButton
              // onPress={
              //   isLastSlide ? navigateToFaceScanCamera : onChangeCarouselSlide
              // }
              onPress={() => {
                let userDemographics = {
                  height: users?.height
                    ? convertFeetAndInchesToCm(
                        Number(users?.height),
                        users?.height_unit,
                      )
                    : undefined,
                  weight: users?.weight
                    ? convertWeightToKg(
                        Number(users?.weight),
                        users?.weight_unit,
                      )
                    : undefined,
                  age: users?.birthdate
                    ? getAgeFromBirthdate(users?.birthdate)
                    : undefined,
                  gender: users?.gender,
                  partnerID: users?.profile_id,
                };

                if (!hasValidUserDemographics(userDemographics)) {
                  // user demographics is not valid, only retain the partnerID
                  userDemographics = {partnerID: users?.profile_id};
                }

                console.log(userDemographics);

                EventBridge.sendEvent(
                  Action.startMeasurement,
                  userDemographics,
                );

                /* Use the following code to customize the measurement page
                EventBridge.sendEvent(Action.synchronizeConfiguration, CustomConfig.measurementConfig)
                EventBridge.sendEvent(Action.synchronizeUIConfiguration, CustomConfig.measurementUIConfig)
              */

                EventBridge.addCommonListener(name => {
                  if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
                    navigation.navigate('ResultPage');
                  }
                });
              }}>
              <CustomText className="text-white text-xl font-isidoraSemiBold">
                Nueralogix
              </CustomText>
            </RoundedButton>
          </View>
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default FaceScan;

const styles = StyleSheet.create({
  carouselImg: {
    aspectRatio: '1/1',
    resizeMode: 'contain',
    // height: 218,
  },
  headerContainer: {
    borderColor: 'rgba(63, 101, 255, 0.41)',
  },
  slide: {
    borderColor: 'rgba(63, 101, 255, 0.41)',
  },
  dotStyle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  paginationContentContainer: {paddingVertical: 0},
  contentContainer: {
    flexGrow: 1,
  },
});

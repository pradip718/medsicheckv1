import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'moti';
import React, {useState} from 'react';
import {Dimensions, Image, ScrollView, StyleSheet, View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import {MainStackParamList} from '../../../types/navigation';
import BackgroundImage from '../../components/BackgroundImage';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import useBackButton from '../../hooks/useBackButton';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import Header from './Header';
import {ENTRIES1} from './data';

const TOTAL_SLIDE = ENTRIES1.length;
const {width} = Dimensions.get('window');

const FaceScan = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {startScan} = usePrepareFacescan();
  const {languages} = useLanguageStore();
  const {setSignoutModalVisibility} = useLoaderStore();
  const progressValue = useSharedValue(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [doNotShowChecked, setDoNotShowChecked] = useState(false);
  const ref = React.useRef<ICarouselInstance>(null);

  const showSignoutModal = () => {
    setSignoutModalVisibility(true);
    return true;
  };
  useBackButton(showSignoutModal);

  const isLastSlide = activeSlide === TOTAL_SLIDE - 1;

  const onChangeActiveSlide = (index: number) => {
    setActiveSlide(index);
  };

  const onDoNotShowChecked = async (check: boolean) => {
    setDoNotShowChecked(check);
  };

  const renderItem = ({item}: {item: any}) => (
    <EtchedGlass
      containerStyle={styles.contentContainer}
      className="justify-center">
      <ScrollView className="max-h-full" showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <Image source={item.illustration} style={styles.carouselImg} />
        </View>
        <CustomText className="mt-10 text-center text-xs mediumPhone:text-sm largePhone:text-base">
          {item.subtitle}
        </CustomText>
      </ScrollView>
    </EtchedGlass>
  );

  return (
    <BackgroundImage>
      <SafeAreaView className="h-full">
        <View className="flex-1">
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

          <View className="justify-center items-center grow">
            <Carousel
              ref={ref}
              loop={false}
              width={width * 0.85}
              // height={500}
              mode="parallax"
              data={ENTRIES1}
              renderItem={renderItem}
              pagingEnabled
              onProgressChange={(_, absoluteProgress) => {
                progressValue.value = absoluteProgress;
              }}
              onSnapToItem={onChangeActiveSlide}
            />
          </View>
        </View>

        <View className="px-10 mb-2">
          <RoundedButton
            onPress={isLastSlide ? startScan : () => ref?.current?.next()}>
            <CustomText className="text-white text-xl font-isidoraSemiBold">
              {isLastSlide
                ? languages?.start_button_text
                : languages?.next_button_txt}
            </CustomText>
          </RoundedButton>
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default FaceScan;

const styles = StyleSheet.create({
  carouselImg: {
    aspectRatio: 1,
    resizeMode: 'contain',
    height: 218,
  },
  headerContainer: {
    borderColor: 'rgba(63, 101, 255, 0.41)',
  },
  contentContainer: {
    flexGrow: 1,
  },
});

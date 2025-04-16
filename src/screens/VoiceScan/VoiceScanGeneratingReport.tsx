import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { Image, View } from 'moti';
import React from 'react';
import { Easing } from 'react-native-reanimated';
import Entypo from 'react-native-vector-icons/Entypo';
import useLanguageStore from '../../../store/languageStore';
import { MainStackParamList } from '../../../types/navigation';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import customColor from '../../theme/customColor';

const VoiceScanGeneratingReport = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const onPressHome = () => {
    navigation.dispatch(
      StackActions.replace('HomepageStackScreens', {
        screen: 'Home',
      }),
    );
  };

  return (
    <View className="justify-center flex-1 bg-white">
      <View
        from={{scale: 0}}
        animate={{scale: 1}}
        transition={{duration: 1000, type: 'timing'} as any}
        className="justify-center items-center mt-10">
        <Image
          source={require('../../../assets/images/preventix_report_loader.png')}
          className="h-[154px] w-[223px] tablet:h-[300px] tablet:w-[400px]"
          resizeMode="cover"
        />
        <View className="absolute right-8 left-0 top-0 bottom-10 tablet:bottom-20 tablet:right-12 items-center  justify-center ">
          <Image
            source={require('../../../assets/images/loader.png')}
            resizeMode="contain"
            className=" h-[37px]"
            from={{
              rotate: '0deg',
            }}
            animate={{
              rotate: '180deg',
            }}
            transition={
              {
                loop: true,
                type: 'timing',
                duration: 2000,
                repeatReverse: false,
                easing: Easing.linear,
              } as any
            }
          />
        </View>
      </View>
      <View
        className="px-6 mt-8 tablet:items-center"
        from={{translateY: 200}}
        animate={{translateY: 0}}
        transition={{duration: 1000, type: 'spring'} as any}>
        <CustomText className="font-isidoraBold text-base text-yankeesBlue">
          {languages?.please_wait_processing_message}
        </CustomText>
        <CustomText className="font-isidoraMedium text-sm text-yankeesBlue mt-2">
          {languages?.report_processing_message}
        </CustomText>
      </View>
      <View className="my-10 px-5">
        <RoundedButton
          resetStyle
          className="py-2 min-w-[182px] bg-[#BCC9FF] rounded-2xl space-x-2"
          onPress={onPressHome}>
          <CustomText className="font-isidoraBold text-lg text-center text-black">
            {languages?.go_to_home}
          </CustomText>

          <Entypo name="home" size={18} color={customColor.black} />
        </RoundedButton>
      </View>
    </View>
  );
};

export default VoiceScanGeneratingReport;

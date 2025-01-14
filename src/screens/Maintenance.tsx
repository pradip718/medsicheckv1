import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {Medsi_Check_Navabar_img} from '../../assets';
import useLanguageStore from '../../store/languageStore';
import {formatTimes, getDeviceLocaleInformation} from '../../utils/methods';
import {getLanguage} from '../api/language';
import BackgroundImage from '../components/BackgroundImage';
import RoundedButton from '../components/RoundedButton';
import CustomText from '../components/Text';
import customColor from '../theme/customColor';

const Maintenance = () => {
  const {languages, setLanguages} = useLanguageStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {utcFormatted, localFormatted} = formatTimes(
    languages?.maintenance_utc_start_time,
    languages?.maintenance_utc_end_time,
  );

  useEffect(() => {
    BootSplash.hide({fade: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const locale = getDeviceLocaleInformation();
      const {data: language} = await getLanguage(locale);
      setLanguages(language);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundImage>
      <SafeAreaView className="h-full">
        <View className="p-6 items-center justify-center">
          <Image
            source={Medsi_Check_Navabar_img as any}
            style={styles.navbarImage}
          />
        </View>
        <ScrollView>
          {!!languages?.maintenance_image_link && (
            <Image
              source={{
                uri: languages?.maintenance_image_link,
              }}
              style={styles.image}
            />
          )}
          <View className="items-center justify-center flex-grow px-6">
            {!!languages?.maintenance_title && (
              <CustomText className="text-2xl font-isidoraBold text-center">
                {languages?.maintenance_title}
              </CustomText>
            )}

            {!!languages?.maintenance_content && (
              <CustomText className="text-lg font-isidoraMedium my-4 text-center">
                {languages?.maintenance_content}
              </CustomText>
            )}

            {(!!languages?.maintenance_utc_start_time ||
              !!languages?.maintenance_utc_end_time) && (
              <View className="my-4">
                <CustomText className="text-lg font-isidoraSemiBold text-center">
                  {languages?.maintenance_time}
                </CustomText>

                <CustomText className="text-lg font-isidoraSemiBold text-center">
                  {languages?.maintenance_utc_time_text} {utcFormatted}
                </CustomText>

                <CustomText className="text-lg font-isidoraSemiBold text-center">
                  {languages?.maintenance_local_time_text} {localFormatted}
                </CustomText>
              </View>
            )}

            {!!languages?.maintenance_footer_message && (
              <CustomText className="text-lg font-isidoraMedium my-2 text-center">
                {languages?.maintenance_footer_message}
              </CustomText>
            )}
            {languages?.isRetryButtonVisible === 'true' && (
              <RoundedButton
                disabled={isLoading}
                resetStyle
                className="py-2 px-8 bg-ultramarineBlue my-4"
                onPress={handleRefresh}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={customColor.white} />
                ) : (
                  <CustomText className="text-white text-lg font-isidoraSemiBold">
                    {languages?.retry_button}
                  </CustomText>
                )}
              </RoundedButton>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default Maintenance;

const styles = StyleSheet.create({
  navbarImage: {
    aspectRatio: '207/30',
    height: 27,
  },
  image: {
    marginVertical: 20,
    width: '50%',
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});

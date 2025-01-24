import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {StackActions} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import useAlertStore from '../../../store/alertStore';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useLanguageStore from '../../../store/languageStore';
import {
  convertFeetAndInchesToCm,
  convertWeightToKg,
  getAgeFromBirthdate,
  hasValidUserDemographics,
} from '../../../utils/methods';
import {navigateToFaceScan} from '../../../utils/navigation';
import Action from '../../config/Action';
import Event from '../../config/Event';
import EventBridge from '../../config/EventBridge';
import useGetRescanConfiguration from '../../hooks/api/useGetRescanConfiguration';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import usePostReadings from '../../hooks/api/usePostReading';
import useFetchBinahConfig from '../../hooks/useFetchBinahConfig';
import customColor from '../../theme/customColor';
import ToolTipWalkthrough from '../CustomCopilot/ToolTipWalkthrough';
import Icon from '../Icon';
import ScanButton from '../ScanButton';
import CustomText from '../Text';

interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar = ({
  state: {index: activeIndex, routes},
  // descriptors,
  navigation,
}: CustomTabBarProps) => {
  const {languages} = useLanguageStore();
  const {showAlert} = useAlertStore();
  const {anuraConfig} = useBinahConfigStore();
  // const [reading_id, setReadingId] = useState('');

  const {data: rescanConfigurations} = useGetRescanConfiguration();
  const {data: users} = useGetUserAttributes();

  const {mutateAsync: getSdkConfig} = useFetchBinahConfig();
  const {mutateAsync: postReadings} = usePostReadings({
    onSuccess: (data, variable) => {
      const {
        payload: {reading_id},
      } = variable;
      navigation.dispatch(
        StackActions.replace('ReportStackScreens', {
          screen: 'Report',
          params: {
            reading_id,
          },
        }),
      );
    },
  });

  useEffect(() => {
    EventBridge.sendEvent(
      Action.synchronizeAppConfiguration,
      anuraConfig?.sdk_value,
    );
  }, [anuraConfig]);

  const addReusltsListener = async () => {
    EventBridge.addReusltsListener(async (name, data) => {
      if (name == Event.anuraMeasurementGetResultsSuccess) {
        console.log('data', data);
        await postReadings({
          payload: {
            data: data?.results,
            scan_error: [],
            reading_id: uuid.v4(),
            timestamp: moment().format('YYYY-MM-DD HH:mm'),
            sdk_name: anuraConfig?.sdk_name,
            sdk_type: anuraConfig?.sdk_type,
          },
        });
      }
    });
  };

  const handleAnuraNavigation = () => {
    console.log('check');
    try {
      let userDemographics = {
        height: users?.height
          ? convertFeetAndInchesToCm(Number(users?.height), users?.height_unit)
          : undefined,
        weight: users?.weight
          ? convertWeightToKg(Number(users?.weight), users?.weight_unit)
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

      EventBridge.sendEvent(Action.startMeasurement, userDemographics);

      /* Use the following code to customize the measurement page
                      EventBridge.sendEvent(Action.synchronizeConfiguration, CustomConfig.measurementConfig)
                      EventBridge.sendEvent(Action.synchronizeUIConfiguration, CustomConfig.measurementUIConfig)
                    */

      EventBridge.addCommonListener(name => {
        addReusltsListener();
        // if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
        //   navigation.navigate('ResultPage');
        // }
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const onPressScanButton = async () => {
    if (rescanConfigurations?.rescan_flag) {
      const {sdk_name} = await getSdkConfig();
      if (sdk_name === 'binaah') {
        navigation?.navigate('FaceScanCamera');
      }
      if (sdk_name === 'nuralogix') {
        handleAnuraNavigation();
      }
      // navigateToFaceScan();
    } else {
      showAlert({
        title: rescanConfigurations?.error || '',
        content: rescanConfigurations?.error_msg || '',
      });
    }
  };

  return (
    <View style={[styles.tabBar]}>
      <View style={styles.tabBarContainer}>
        <ImageBackground
          source={require('../../../assets/images/tabbar.png')}
          className="relative"
          style={styles.backgroundImage}>
          {routes.map((route, index: number) => {
            const isFocused = index === activeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // const {options} = descriptors[route.key];
            if (route.name === 'Scan') {
              return (
                <View key={`${route.name}-${index}`}>
                  <View
                    style={styles.scanContainer}
                    className="absolute left-[50%]  bg-green-400"
                    key={`${route.name}-${index}`}>
                    <ToolTipWalkthrough
                      walkthroughName="scan_button"
                      placement="top">
                      <ScanButton onPressScanButton={onPressScanButton} />
                    </ToolTipWalkthrough>
                  </View>
                  <CustomText className="absolute bottom-3 -left-7 w-[150] font-isidoraMedium">
                    {languages?.faceScan}
                  </CustomText>
                </View>
              );
            }

            if (route.name === 'Homepage') {
              return (
                <TouchableOpacity
                  key={`${route.name}-${index}`}
                  className="h-[80px] pt-4"
                  onPress={onPress}
                  onLongPress={onLongPress}>
                  <View
                    className={
                      isFocused
                        ? 'bg-white rounded-xl p-2 items-center space-y-1'
                        : 'p-2 items-center space-y-1'
                    }>
                    <Icon
                      name="Home"
                      size={24}
                      color={
                        isFocused
                          ? customColor.blueBerry
                          : customColor.extraGrey
                      }
                    />
                    <CustomText
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className={`w-[50] text-center ${
                        isFocused ? 'font-isidoraBold' : ''
                      }`}>
                      {languages?.home}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              );
            }
            if (route.name === 'Profile') {
              return (
                <TouchableOpacity
                  key={`${route.name}-${index}`}
                  className="h-[80px] pt-4"
                  onPress={onPress}
                  onLongPress={onLongPress}>
                  <View
                    className={`p-2 items-center space-y-1 ${
                      isFocused ? 'bg-white rounded-xl ' : ''
                    }`}>
                    <Icon
                      name="profile"
                      size={20}
                      color={
                        isFocused
                          ? customColor.blueBerry
                          : customColor.extraGrey
                      }
                    />
                    <CustomText
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className={`w-[50] text-center ${
                        isFocused ? 'font-isidoraBold' : ''
                      }`}>
                      {languages?.profile}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              );
            }
          })}
        </ImageBackground>
      </View>
    </View>
  );
};

export default CustomTabBar;

export const styles = StyleSheet.create({
  tabBar: {
    // backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  scanContainer: {
    backgroundColor: 'transparent',
    // marginRight: 2,
    transform: [
      {
        translateX: -30,
      },
      {
        translateY: -8,
      },
    ],
  },
  backgroundImage: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 88,
    width: '100%',
  },
});

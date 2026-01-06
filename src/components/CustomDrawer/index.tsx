import {DrawerContentScrollView} from '@react-navigation/drawer';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {isArray} from 'lodash';
import React, {useEffect} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Badge} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {twMerge} from 'tailwind-merge';
import {Medsi_Check_Navabar_img} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import {MainStackParamList} from '../../../types/navigation';
import {
  shouldGoToFaceScan,
  shouldGoToVoiceScan,
} from '../../../utils/navigation';
import {FAMILY_INFO, MY_INFO} from '../../constants/enums';
import {useGetHelpdeskDetails} from '../../hooks/api/helpdesk';
import useGetFamilyMembers from '../../hooks/api/useGetFamilyMembers';
import useGetRescanConfiguration from '../../hooks/api/useGetRescanConfiguration';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import customColor from '../../theme/customColor';
import Icon from '../Icon';
import Pressable from '../Pressable';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

const Profile = ({
  // profileId,
  email,
  name,
}: {
  profileId: string;
  email: string;
  name: string | null;
}) => {
  const {languages} = useLanguageStore();
  const {data: familyMembers = []} = useGetFamilyMembers({
    enabled: false,
  });
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const onViewProfile = () => {
    navigation?.navigate('Profile', {
      tab: {name: MY_INFO},
    });
  };
  const onSwitchProfile = () => {
    navigation?.navigate('Profile', {
      tab: {name: FAMILY_INFO},
    });
  };

  const onAddProfile = () => {
    navigation?.navigate('FamilyInformation');
  };

  const hasOtherMembers = familyMembers?.length > 1;

  return (
    <View className="bg-yankeesBlue min-h-[129px] py-4 px-8 rounded-3xl">
      {!!name && (
        <CustomText
          className="font-isidoraSemiBold text-2xl text-white  overflow-hidden"
          numberOfLines={2}
          ellipsizeMode="tail">
          {name}
        </CustomText>
      )}
      {!!email && (
        <CustomText
          className="font-isidoraMedium text-sm text-white"
          numberOfLines={2}
          ellipsizeMode="tail">
          {email}
        </CustomText>
      )}

      <View>
        <RoundedButton
          resetStyle
          className=" bg-ultramarineBlue mt-2 px-2 py-1"
          activeOpacity={0.6}
          onPress={onViewProfile}>
          <CustomText className="text-white font-isidoraMedium text-sm">
            {languages?.view_profile}
          </CustomText>
        </RoundedButton>
        <RoundedButton
          resetStyle
          className=" bg-cornflowerBlue mt-2 px-2 py-1"
          activeOpacity={0.6}
          onPress={hasOtherMembers ? onSwitchProfile : onAddProfile}>
          <CustomText
            className="text-black font-isidoraMedium text-sm"
            numberOfLines={2}>
            {hasOtherMembers
              ? languages?.switch_profile
              : languages?.add_member}
          </CustomText>
        </RoundedButton>
      </View>
    </View>
  );
};

const MenuItem = ({
  name,
  icon,
  action,
  disabled,
  iconType,
}: {
  name: string;
  icon?: string;
  iconType?: string;
  action: (() => void) | undefined;
  disabled: boolean;
}) => {
  return (
    <TouchableOpacity
      className={twMerge('flex-row items-center justify-between px-10 py-2')}
      onPress={() => {
        if (action) {
          action();
        }
      }}
      disabled={disabled}>
      <View className="flex-row items-center">
        <View className="w-8">
          {icon &&
            (iconType === 'material_icon' ? (
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={disabled ? customColor?.pichartGrey : customColor.black}
              />
            ) : (
              <Icon
                name={icon}
                size={20}
                color={disabled ? customColor?.pichartGrey : customColor.black}
              />
            ))}
        </View>
        <CustomText
          className={twMerge(
            'text-sm font-isidoraSemiBold',
            disabled ? 'text-slate-400' : '',
          )}>
          {name}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

const CustomDrawer = () =>
  // props: DrawerContentComponentProps
  {
    const {data: userAttributes} = useGetUserAttributes();

    const {languages} = useLanguageStore();
    const {setSignoutModalVisibility} = useLoaderStore();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const {data: rescanConfigurations} = useGetRescanConfiguration();
    const {data: helpDeskDetails} = useGetHelpdeskDetails();

    const {startScan} = usePrepareFacescan();
    const [hasUnreadMessage, setHasUnreadMessage] = React.useState(false);

    const handleScanButtonPress = async () => {
      const shouldGoToFacescan = await shouldGoToFaceScan();
      if (shouldGoToFacescan) {
        startScan();
      } else {
        navigation.navigate('FaceScan');
      }
    };

    const handleVoiceScanButtonPress = async () => {
      const shouldGoToFacescan = await shouldGoToVoiceScan();
      if (shouldGoToFacescan) {
        navigation.navigate('VoiceScanScreen');
      } else {
        navigation.navigate('VoiceScanIntroScreen');
      }
    };

    useEffect(() => {
      if (isArray(helpDeskDetails)) {
        setHasUnreadMessage(
          helpDeskDetails?.some(
            msg => msg?.status === 'open' && !msg.read_flag,
          ),
        );
      }
    }, [helpDeskDetails]);

    const DRAWER_MENU = [
      {
        name: languages?.faceScan,
        icon: 'face_scan',
        action: handleScanButtonPress,
        disabled: !rescanConfigurations?.rescan_flag,
      },
      {
        name: languages?.voice_scan,
        icon: 'microphone-outline',
        icon_type: 'material_icon',
        action: handleVoiceScanButtonPress,
      },
      {
        name: languages?.menu_health_profile,
        icon: 'health_profile',
        // action: () => navigation.navigate('AdditionalInformation'),
        action: () => navigation.navigate('QuestionnaireSection'),

        disabled: false,
      },
      {
        name: languages?.menu_smart_report,
        icon: 'personal_report',
        disabled: false,
        action: () => navigation.navigate('SmartReport'),
      },
      {
        name: languages?.health_risk,
        icon: 'warning',
        disabled: false,
        action: () => navigation.navigate('HealthRisks'),
      },
      {
        name: languages?.menu_health_wallet,
        icon: 'health_wallet',
        action: () => navigation.navigate('HealthWallet'),
      },
      {
        name: languages?.menu_setting,
        icon: 'setting',
        action: () => navigation.navigate('Settings'),
      },
      {
        name: languages?.menu_information,
        icon: 'information',
        action: () => navigation.navigate('AboutApp'),
        disabled: false,
      },
    ];

    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1" style={styles.container}>
          <DrawerContentScrollView>
            {/* <DrawerItemList {...props} /> */}
            <View className="flex-grow items-center py-6">
              <Image
                source={Medsi_Check_Navabar_img as any}
                style={styles.navbarImage}
              />
            </View>
            <View className="px-4 mb-4">
              <Profile
                profileId={userAttributes?.profile_id || ''}
                name={
                  userAttributes?.given_name || userAttributes?.family_name
                    ? `${userAttributes?.given_name || ''} ${
                        userAttributes?.family_name || ''
                      }`
                    : null
                }
                email={userAttributes?.email || ''}
              />
            </View>

            {DRAWER_MENU?.map(eachMenu => (
              <View className="my-2" key={eachMenu?.name}>
                <MenuItem
                  name={eachMenu.name}
                  icon={eachMenu.icon}
                  action={eachMenu?.action}
                  iconType={eachMenu?.icon_type ?? ''}
                  disabled={eachMenu?.disabled || false}
                />
              </View>
            ))}
          </DrawerContentScrollView>

          <Pressable
            className="items-center space-x-4 mt-4 flex-row pl-10 pr-2"
            onPress={() => {
              navigation.navigate('HelpDesk');
            }}>
            <Icon name={'helpdesk_1'} size={20} color={customColor.black} />
            <CustomText className="text-sm font-isidoraSemiBold">
              {languages?.help_desk}
            </CustomText>
            {hasUnreadMessage && (
              <Badge className="absolute right-4 top-1" size={12} />
            )}
          </Pressable>
          <TouchableOpacity
            className="items-center space-x-4 mt-4 py-4 flex-row pl-10 pr-2"
            onPress={() => {
              setSignoutModalVisibility(true);
            }}>
            <Icon name={'sign_out'} size={20} color={customColor.black} />
            <CustomText className="text-sm font-isidoraSemiBold">
              {languages?.sign_out}
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {},
  navbarImage: {
    aspectRatio: '207/30',
    height: 30,
  },
  profileImg: {
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

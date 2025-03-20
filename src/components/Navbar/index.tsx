import {
  CommonActions,
  DrawerActions,
  NavigationProp,
  StackActions,
  // NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {isArray} from 'lodash';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Badge, Modal, Portal} from 'react-native-paper';
import {Medsi_Check_Navabar_img} from '../../../assets';
import colors from '../../../colors';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import {MainStackParamList} from '../../../types/navigation';
import {useGetHelpdeskDetails} from '../../hooks/api/helpdesk';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import useGetProfileImage from '../../hooks/useGetProfileImage';
import {color} from '../../theme';
import customColor from '../../theme/customColor';
import ToolTipWalkthrough from '../CustomCopilot/ToolTipWalkthrough';
import Icon from '../Icon';
import SignoutModal from '../SignoutModal';
import CustomText from '../Text';
import ProfileModal from './ProfileModal';

type NavbarProps = {
  hasProfile?: boolean;
  hasClose?: boolean;
  hasSave?: boolean;
  noBack?: boolean;
  hasDrawer?: boolean;
  hasShare?: boolean;
  hasLogout?: boolean;
  handleShare?: () => void;
  handleSave?: () => void;
  onBackClick?: () => void;
  handleClose?: () => void;
};

type ProfileProps = {
  showModal: () => void;
  hideModal: () => void;
  profileId: string;
  copilot?: any;
};

const Profile = ({showModal, profileId, copilot}: ProfileProps) => {
  const {avatarSource} = useGetProfileImage(profileId || '');
  return (
    <TouchableOpacity
      className="border-2 rounded-full h-8 w-8 items-center justify-center overflow-hidden"
      style={{
        borderColor: customColor.blueBerry,
      }}
      onPress={showModal}
      {...copilot}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.profileImg} />
      ) : (
        <Icon name="person" size={20} color={customColor.blueBerry} />
      )}
    </TouchableOpacity>
  );
};

const Menu = ({copilot}: any) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
      className="p-2"
      {...copilot}>
      <Icon name="menu" size={20} color={color.accentBlue} />
    </TouchableOpacity>
  );
};

const Navbar = (props: NavbarProps) => {
  const {
    hasProfile,
    hasClose,
    hasSave,
    hasShare,
    handleShare,
    handleSave,
    noBack = false,
    onBackClick,
    hasDrawer = false,
    handleClose,
    hasLogout = false,
  } = props;
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {setSignoutModalVisibility, signoutModalVisibility: modalVisible} =
    useLoaderStore();
  const {data: userAttributes} = useGetUserAttributes();
  const {data: helpDeskDetails} = useGetHelpdeskDetails({enabled: false});

  const [hasUnreadMessage, setHasUnreadMessage] = React.useState(false);

  useEffect(() => {
    if (isArray(helpDeskDetails)) {
      setHasUnreadMessage(
        helpDeskDetails?.some(msg => msg?.status === 'open' && !msg.read_flag),
      );
    }
  }, [helpDeskDetails]);

  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      return navigation.dispatch(
        StackActions.replace('HomepageStackScreens', {
          screen: 'Home',
        }),
      );
    }
  };

  const renderLeftItem = () => {
    switch (true) {
      case !hasClose && !noBack:
        return (
          <TouchableOpacity
            onPress={onBackClick ? onBackClick : handleBackPress}
            className="p-2">
            <Icon name="back" size={20} color={color.accentBlue} />
          </TouchableOpacity>
        );
      case hasDrawer:
        return (
          <ToolTipWalkthrough walkthroughName="drawer_button" placement="right">
            <Menu />
            {hasUnreadMessage && (
              <Badge className="absolute right-1 top-[6px]" size={10} />
            )}
          </ToolTipWalkthrough>
        );
      default:
        return <View className="p-2" />;
    }
  };

  const renderRightItem = () => {
    switch (true) {
      case hasProfile:
        return (
          <ToolTipWalkthrough walkthroughName="menu_button" placement="left">
            <Profile
              showModal={showModal}
              hideModal={hideModal}
              profileId={userAttributes?.profile_id || ''}
            />
          </ToolTipWalkthrough>
        );
      case hasClose:
        return (
          <TouchableOpacity
            className="items-end"
            onPress={() => {
              if (handleClose) {
                handleClose();
              } else {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {name: 'HomepageStackScreens', params: {screen: 'Home'}},
                    ],
                  }),
                );
              }
            }}>
            <Icon name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
        );
      case hasSave:
        return (
          <TouchableOpacity onPress={handleSave} className="items-end">
            <CustomText className=" text-ultramarineBlue font-isidoraSemiBold text-base">
              {languages?.save || ''}
            </CustomText>
          </TouchableOpacity>
        );
      case hasShare:
        return (
          <TouchableOpacity onPress={handleShare} className="items-end">
            <Icon name="share" size={24} color={colors.primary} />
          </TouchableOpacity>
        );
      case hasLogout:
        return (
          <TouchableOpacity
            onPress={() => setSignoutModalVisibility(true)}
            className="justify-center items-center p-2">
            <Icon name="sign_out" size={20} color={colors.primary} />
          </TouchableOpacity>
        );
      default:
        return <View className="p-2" />;
    }
  };

  return (
    <View className="flex-row justify-between items-center">
      <View className="z-10">{renderLeftItem()}</View>
      <View className="flex-grow items-center absolute m-auto left-0 right-0 z-0">
        <Image
          source={Medsi_Check_Navabar_img as any}
          style={styles.navbarImage}
        />
      </View>
      <View className="z-10">{renderRightItem()}</View>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          style={styles.modalStyle}
          contentContainerStyle={styles.modalContentContainer}>
          <ProfileModal hideModal={hideModal} />
        </Modal>
      </Portal>

      <SignoutModal visible={modalVisible} />
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  navbarImage: {
    aspectRatio: '207/30',
    height: 27,
  },
  profileModalContainer: {
    backgroundColor: 'rgba(216, 224, 255, 1)',
    width: 303,
    // height: 436,
    height: 200,
    borderRadius: 20,
    paddingVertical: 20,
  },
  modalContentContainer: {
    marginVertical: 40,
    marginRight: 20,
  },
  modalStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileImg: {
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  signoutModalStyle: {
    backgroundColor: '#fff',
    height: 20,
  },
});

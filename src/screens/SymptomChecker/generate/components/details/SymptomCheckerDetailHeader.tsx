import React, {memo, useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';

// import {onShareFile} from '@/utils/report';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {formatDate, formatTime} from '../../../../../../utils/symptom';
import EclipseBackground from '../../../../../components/EclipseBackground';
import Icon from '../../../../../components/Icon';
import {goToHome} from '../../../../../../utils/navigation';
import {BOLD} from '../../../../../constants/Fonts';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../../../../../../types/navigation';
import CustomText from '../../../../../components/Text';
import {onShareSymptomFile} from '../../../../../../utils/methods';

interface ReportHeaderProps {
  createdAt: string;
  title: string;
  reportLink?: string;
  isGeneration?: boolean;
  onDelete: () => void;
  onShare?: () => void;
}

const ReportHeader = ({
  createdAt,
  title,
  reportLink,
  onDelete,
  onShare,
  isGeneration,
}: ReportHeaderProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {top} = useSafeAreaInsets();

  const reportDate = useMemo(() => {
    const formattedDate = formatDate(createdAt, 'MMM dd, yyyy') || '-';
    const formattedTime = formatTime(createdAt) || '-';
    return `${formattedDate} (${formattedTime})`;
  }, [createdAt]);

  const onShareReport = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (reportLink) {
      await onShareSymptomFile(reportLink);
    }
  };

  return (
    <View className="relative mb-8">
      <EclipseBackground
        containerStyle={styles.backgroundContainer}
        backgroundImageStyle={[styles.backgroundImage, {paddingTop: top + 12}]}>
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-6">
            {isGeneration ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={goToHome}>
                <Icon name="home" size={26} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={() => navigation.goBack()}>
                <Icon name="left" size={18} color="#fff" />
              </TouchableOpacity>
            )}
            <View className="flex-row items-center" style={{gap: 8}}>
              {/* <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
                <AntDesign name="questioncircle" size={20} color="#fff" />
              </TouchableOpacity> */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={onShareReport}>
                <AntDesign name="sharealt" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={onDelete}>
                <Feather name="trash-2" size={21} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </EclipseBackground>
      <View className="absolute -bottom-6 w-fit px-6 bg-[#1671C0] left-4 h-12 items-center flex-row justify-center border-4 border-white rounded-xl">
        <CustomText style={styles.dateText}>{reportDate}</CustomText>
      </View>
    </View>
  );
};
export default memo(ReportHeader);

const styles = StyleSheet.create({
  backgroundContainer: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  backgroundImage: {
    paddingBottom: 40,
    position: 'relative',
  },
  actionButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF52',
    borderRadius: 14,
  },
  title: {
    fontFamily: BOLD,
    fontSize: 24,
    lineHeight: 32,
    color: '#fff',
  },
  dateText: {
    fontFamily: BOLD,
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
});

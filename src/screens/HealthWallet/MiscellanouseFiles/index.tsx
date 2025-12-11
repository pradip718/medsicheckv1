import {NavigationProp, useNavigation} from '@react-navigation/native';
import _ from 'lodash';
import moment from 'moment';
import {View} from 'moti';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useLanguageStore from '../../../../store/languageStore';
import {MiscellanousFilesType} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {downloadFile, onShareFile} from '../../../../utils/methods';
import EmptyScreen from '../../../components/EmptyScreen';
import FallbackScreen from '../../../components/FallbackScreen';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {useGetMiscellanouseFileDetails} from '../../../hooks/api/report';
import customColor from '../../../theme/customColor';

const MiscellaneousFiles = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const {
    data: miscellaneousFiles,
    isLoading: isMiscellaneousFilesLoading,
    refetch: getMiscellanousFileDetails,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetMiscellanouseFileDetails();

  if (!miscellaneousFiles && !isMiscellaneousFilesLoading) {
    return <FallbackScreen />;
  }

  const navigateToViewReport = (fileLink: string) => {
    navigation.navigate('ViewReport', {
      uri: fileLink,
    });
  };

  if (_.isEmpty(miscellaneousFiles)) {
    return <EmptyScreen message={languages?.empty_miscellaneous_file} />;
  }

  const renderHeader = () => {
    return (
      <View className="py-4">
        <Navbar />
      </View>
    );
  };

  const renderItem = ({item: list}: {item: MiscellanousFilesType}) => {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-between border border-[#868686] rounded-3xl px-4  mt-4"
        disabled={!list.s3_link}
        onPress={() => navigateToViewReport(list.s3_link)}>
        <View className="flex-row justify-between items-center space-x-2 w-full">
          <CustomText>
            {moment(list.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </CustomText>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="p-4 items-center justify-center"
              disabled={!list.s3_link}
              onPress={() => downloadFile(list.s3_link, 'Miscellaneous Files')}>
              <Icon
                name="download"
                size={18}
                color={
                  !list.s3_link
                    ? customColor.lightGrey
                    : customColor.ultramarineBlue
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-4 items-center justify-center"
              disabled={!list.s3_link}
              onPress={() => onShareFile(list.s3_link, 'miscellaneous')}>
              <Icon
                name="share"
                size={16}
                color={
                  !list.s3_link
                    ? customColor.lightGrey
                    : customColor.ultramarineBlue
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={getMiscellanousFileDetails}
          />
        }
        contentContainerStyle={styles.contentContainer}
        className="px-4"
        data={miscellaneousFiles?.data}
        keyExtractor={item => item.upload_id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={styles.listFooterComponent}>
            {isFetchingNextPage && (
              <ActivityIndicator
                size="large"
                color={customColor.ultramarineBlue}
              />
            )}
          </View>
        }
        onEndReached={() => {
          hasNextPage && fetchNextPage();
        }}
      />
    </SafeAreaView>
  );
};

export default MiscellaneousFiles;

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  listFooterComponent: {
    flexDirection: 'row',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

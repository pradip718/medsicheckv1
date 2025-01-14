import {NavigationProp, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {HomepageParamList} from '../../../../types/navigation';
import DonutChart from '../../../components/Graphs/DonutChart';
import Icon from '../../../components/Icon';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

type PreviousReportCardProps = {
  score: number;
  timeframe: string | undefined;
  id: string;
};

const PreviousReportCard = ({
  score,
  timeframe,
  id,
}: PreviousReportCardProps) => {
  const navigation = useNavigation<NavigationProp<HomepageParamList>>();

  const navigateToReportList = () => {
    navigation.navigate('ReportList', {
      reportId: id,
    });
  };

  const renderCenterLabel = () => (
    <CustomText className="text-white text-xl font-isidoraSemiBold">
      {score}/10
    </CustomText>
  );

  return (
    <Pressable
      onPress={navigateToReportList}
      style={styles.container}
      className="flex-row h-[108] rounded-3xl overflow-hidden justify-between items-center">
      <View
        className="h-full w-[108px] bg-yankeesBlue rounded-3xl"
        style={styles.donutChartContainer}>
        <DonutChart
          score={score}
          innerRadius={30}
          radius={40}
          centerLabelComponent={renderCenterLabel}
        />
      </View>
      {timeframe ? (
        <View>
          <CustomText className="text-base font-isidoraSemiBold text-[#1E3180]">
            {moment(timeframe).format('DD-MMM-YYYY')}
          </CustomText>
          <CustomText className="text-base font-isidoraSemiBold text-[#1E3180] text-center">
            {moment(timeframe).format('h:mm a')}
          </CustomText>
          {/* <CustomText className="text-[#F65515] text-sm">
          Total Critical Parameters: 1
        </CustomText> */}
        </View>
      ) : (
        <></>
      )}
      <Icon
        name="right_arrow"
        size={20}
        color={customColor.blueBerry}
        className="px-4"
      />
    </Pressable>
  );
};

export default PreviousReportCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(216, 224, 255, 1)',
  },
  donutChartContainer: {
    backgroundColor: '#192445',
  },
});

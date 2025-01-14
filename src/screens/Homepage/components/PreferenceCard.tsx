import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import useLanguageStore from '../../../../store/languageStore';
import Metrics from '../../../../utils';
import TrendGraph from '../../../components/Graphs/TrendGraph';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

type PreferenceCardProps = {
  iconName: string;
};

const PreferenceCard = ({iconName}: PreferenceCardProps) => {
  const {languages} = useLanguageStore();

  // const data = [
  //   {value: 50, label: '02.07.2024'},
  //   {value: 70, label: '11.07.2024'},
  //   {value: 65, label: '15.07.2024'},
  //   {value: 80, label: '20.07.2024'},
  //   {value: 110, label: '26.07.2024'},
  // ];
  const chartConfig = {
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    decimalPlaces: 2,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const yAxisLabel = ['0', '50', '100', '150'];
  const colors = ['#FFB2B2', '#FFC4C4', '#FFF0B2', '#C4FFB2'];

  const data = [
    {value: 110},
    {value: 130},
    {value: 120},
    {value: 160},
    {value: 190},
  ];

  return (
    <View
      className="border border-[#A1AAFF] rounded-3xl p-4 overflow-hidden"
      style={{width: Metrics.screenWidth - 40}}>
      <View className="flex-row items-center justify-between flex-wrap">
        <View className="flex-row gap-x-4 items-center">
          <View
            className="rounded-2xl w-[50px] h-[50px] justify-center items-center"
            // style={{backgroundColor: highlightedColor}}
            style={{backgroundColor: 'green'}}>
            <Icon name={iconName} size={30} color={customColor.white} />
          </View>
          <View>
            <CustomText className="text-midnightBlue text-xl font-isidoraSemiBold smallPhone:text-sm">
              {/* {healthMetricsValue}{' '} */}97
              <CustomText className="text-midnightBlue text-sm font-isidoraSemiBold">
                {/* {healthMetricsIndex} */}
                {'  '}bpm
              </CustomText>
            </CustomText>
            <CustomText className="text-midnightBlue text-sm font-isidoraSemiBold">
              {/* {healthMetricsTitle} */}Heart Rate
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          className="mt-2"
          // onPress={onDetailsPress}
        >
          <CustomText
            className="underline text-xs font-isidoraSemiBold"
            // style={{color: highlightedColor}}
          >
            {languages?.more_details_link_txt}
            {' >'}
          </CustomText>
        </TouchableOpacity>
      </View>

      <View className="mt-4">
        <LineChart
          data={[
            {
              value: 110,
              dataPointColor: 'red',
              stripColor: 'red',
              verticalLineColor: 'red',
              focusedDataPointColor: 'red',
            },
            {value: 130},
            {value: 120},
            {value: 160},
            {value: 190},
          ]}
          adjustToWidth
          height={128}
        />
      </View>
    </View>
  );
};

export default PreferenceCard;

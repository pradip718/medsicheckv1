import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';
import {
  // PieChart,
  PieChartPropsType,
  pieDataItem,
} from 'react-native-gifted-charts';
import {getImgBasedOnScore} from '../../../utils/methods';
// import CustomText from '../Text';

interface DonutChartProps extends Omit<PieChartPropsType, 'data'> {
  score: number;
}

const DonutChart = ({
  score,
}: // ...restProps
DonutChartProps) => {
  const [imgSource, setImgSource] = useState('');

  useEffect(() => {
    const img = `../../../assets/images/CircularProgress/progress_${score}.png`;
    if (img) {
      setImgSource(img);
    } else {
      setImgSource('');
    }
  }, [score]);
  let pieData: pieDataItem[] = [];
  let accumulatedValue = 0;

  [
    {value: 2, color: 'red'},
    {value: 2, color: 'orange'},
    {value: 2, color: 'yellow'},
    {value: 2, color: 'lightgreen'},
    {value: 2, color: 'green'},
  ].forEach(eachPieData => {
    accumulatedValue += eachPieData.value;
    if (accumulatedValue <= score) {
      pieData.push(eachPieData);
    } else {
      pieData.push({value: 2, color: 'rgba(50, 71, 161, 1)'});
    }
  });

  // const renderCenterLabel = () => (
  //   <CustomText className="text-white text-2xl font-isidoraSemiBold">
  //     {score}/10
  //   </CustomText>
  // );

  return (
    <View className="flex-1 items-center justify-center w-full">
      <Image
        source={getImgBasedOnScore(score)}
        className="w-[80%]"
        resizeMode="contain"
      />
      {/* <PieChart
        donut
        innerRadius={50}
        data={pieData}
        centerLabelComponent={renderCenterLabel}
        innerCircleColor={'rgba(30, 49, 128, 1)'}
        showGradient
        gradientCenterColor="rgba(50, 71, 161, 1)"
        initialAngle={30}
        radius={70}
        {...restProps}
      /> */}
    </View>
  );
};

export default DonutChart;

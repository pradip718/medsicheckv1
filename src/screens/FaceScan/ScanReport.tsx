import {useVitalSigns} from 'biosensesignal-react-native-sdk';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {PreHealthConfiguration} from '../../../types/readings';
import EtchedGlass from '../../components/EtchedGlass';
import Icon from '../../components/Icon';
import CustomText from '../../components/Text';
import {color} from '../../theme';

type ScanReportProps = {
  progress?: number;
  preReadingConfig?: PreHealthConfiguration[];
};

const ScanReport = ({preReadingConfig}: ScanReportProps) => {
  const [measurementDetails, setMeasurementDetails] =
    useState(preReadingConfig);
  const vitalSign = useVitalSigns();

  useEffect(() => {
    setMeasurementDetails(preReadingConfig);
  }, [preReadingConfig]);

  useEffect(() => {
    const updateScanReport = () => {
      if (!measurementDetails) {
        return;
      }
      const parameterIndex = measurementDetails.findIndex(
        measurement => measurement.vitalType === vitalSign?.type,
      );

      if (parameterIndex !== -1 && vitalSign) {
        const updatedDetails = [...measurementDetails];
        let parameter = updatedDetails[parameterIndex];

        if (parameter) {
          const relative = parameter.config?.relative ?? 0;
          parameter = {
            ...parameter,
            value: vitalSign.value + relative,
          };
          updatedDetails[parameterIndex] = parameter;
          setMeasurementDetails(updatedDetails);
        }
      }
    };

    updateScanReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitalSign]);

  // useEffect(() => {
  //   const updateParameterRandomly = () => {
  //     // Update a random parameter value
  //     const randomIndex = Math.floor(Math.random() * measurementDetails.length);
  //     const updatedDetails = [...measurementDetails];
  //     const parameter = updatedDetails[randomIndex];

  //     switch (parameter.name) {
  //       case 'Heart Rate':
  //         parameter.value = Math.floor(Math.random() * (120 - 60) + 60);
  //         break;
  //       case 'Oxygen Sat.':
  //         parameter.value = `${Math.floor(Math.random() * (100 - 90) + 90)}%`;
  //         break;
  //       case 'Respiration':
  //         parameter.value = Math.floor(Math.random() * (20 - 10) + 10);
  //         break;
  //       case 'HRV':
  //         parameter.value = Math.floor(Math.random() * (100 - 50) + 50);
  //         break;
  //       case 'Stress Level':
  //         parameter.value = Math.floor(Math.random() * 101);
  //         break;
  //       case 'Blood Pressure':
  //         parameter.value = `${Math.floor(
  //           Math.random() * (140 - 100) + 100,
  //         )}/${Math.floor(Math.random() * (90 - 60) + 60)}`;
  //         break;
  //       default:
  //         break;
  //     }

  //     setMeasurementDetails(updatedDetails);
  //   };

  //   if (progress && progress >= 0.3) {
  //     const intervalId = setInterval(updateParameterRandomly, 500);
  //     if (progress >= 1) {
  //       clearInterval(intervalId);
  //     }
  //     return () => clearInterval(intervalId);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [progress]);

  return (
    <View
      className="flex-row flex-wrap justify-center"
      style={styles.container}>
      {measurementDetails?.map(parameter => (
        <EtchedGlass
          key={`${parameter.name}`}
          className="mt-6 rounded-xl w-[112px] h-[110px]  mx-1"
          cardContentClassName="p-0"
          cardContentContainerClassName="p-0">
          <View className="h-full  justify-between">
            <View className="justify-center">
              <CustomText className="text-sm font-isidoraMedium text-center">
                {parameter.name}
              </CustomText>
              <CustomText className="text-xl font-isidoraSemiBold text-center">
                {parameter.value}
              </CustomText>
              <CustomText className="text-sm font-isidoraSemiBold text-center">
                {parameter.unit}
              </CustomText>
            </View>
            <View className="absolute bottom-2 left-2">
              <Icon
                name={parameter?.iconName}
                size={20}
                color={color.ultramarineBlue}
              />
            </View>
          </View>
        </EtchedGlass>
      ))}
    </View>
  );
};

export default ScanReport;

const styles = StyleSheet.create({
  container: {},
});

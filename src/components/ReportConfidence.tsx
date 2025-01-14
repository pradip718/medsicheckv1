import {isEmpty} from 'lodash';
import {AnimatePresence, ScrollView, View, motify} from 'moti';
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {Surface} from 'react-native-paper';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../store/languageStore';
import {VitalSignData} from '../../types/jsons';
import {ConfidenceLevelKeys} from '../../types/reports';
import {getConfidenceColor} from '../../utils/methods';
import {ConfidenceLevels} from '../constants/enums';
import {useGetUserReadingDetail} from '../hooks/api/readings';
import CustomText from './Text';

const AnimatedSurface = motify(Surface)();

interface ReportConfidenceProps {
  classNameValue?: string;
  readingsConfidence?: [string, VitalSignData][];
  overallConfidence?: keyof typeof ConfidenceLevels;
  readingId: string;
}

const ConfidenceLevel = ({level}: {level: ConfidenceLevelKeys}) => {
  return (
    <View style={styles.confidenceRow}>
      <View style={styles.confidenceBars}>
        {getConfidenceColor(level).map((color, index) => (
          <View
            key={index}
            style={[styles.confidenceBar, {backgroundColor: color}]}
          />
        ))}
      </View>
    </View>
  );
};

export default function ReportConfidence(props: ReportConfidenceProps) {
  const {languages} = useLanguageStore();
  const [isSubConfidenceVisible, setIsSubConfidenceVisible] =
    useState<boolean>(false);
  const {overallConfidence, readingsConfidence, readingId} = props;

  const {data: reportData} = useGetUserReadingDetail({
    reading_id: readingId,
    enabled: false,
  });

  const onChangeConfidenceVisibility = () => {
    setIsSubConfidenceVisible(state => !state);
  };

  if (!overallConfidence) {
    return <></>;
  }

  const isDropdownDisabled = !readingsConfidence || isEmpty(readingsConfidence);

  return (
    <>
      <View className={twMerge('border rounded p-2', props.classNameValue)}>
        <Pressable
          android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
          className={twMerge(
            'flex-row justify-between items-center',
            isDropdownDisabled && 'opacity-50',
          )}
          onPress={onChangeConfidenceVisibility}
          disabled={isDropdownDisabled}>
          <View className="flex-1">
            <CustomText className="font-isidoraSemiBold text-sm">
              {languages?.overall_confidence_level_parameters}
            </CustomText>
            <CustomText className="text-xs font-isidoraMedium text-gray-500">
              {languages?.confidence_level_description}
            </CustomText>
          </View>
          <View
            className="px-4 py-2 rounded"
            style={{
              backgroundColor:
                ConfidenceLevels[overallConfidence] ??
                ConfidenceLevels?.Default,
            }}>
            <CustomText className="text-white text-sm font-isidoraMedium">
              {overallConfidence}
            </CustomText>
          </View>
        </Pressable>
      </View>

      <AnimatePresence>
        {isSubConfidenceVisible && (
          <AnimatedSurface
            from={{height: 0, opacity: 0, padding: 0}}
            animate={{
              height: readingsConfidence?.length
                ? readingsConfidence?.length * 40
                : 200,
              opacity: 1,
              overflow: 'hidden',
              padding: 4,
            }}
            exit={{height: 0, opacity: 0, padding: 0}}
            transition={{type: 'timing', duration: 400} as any}
            className=" bg-white rounded-b-lg h-full overflow-hidden mx-5">
            <ScrollView>
              {!isEmpty(readingsConfidence) &&
                readingsConfidence?.map(([vitalKey, {confidence_level}]) => (
                  <View key={vitalKey} className="flex-row p-2">
                    <CustomText className="font-isidoraMedium text-sm w-[70%]">
                      {reportData?.data?.config?.[vitalKey]?.display || ''}
                    </CustomText>
                    {!!confidence_level && (
                      <View className="w-[30%]">
                        <ConfidenceLevel level={confidence_level} />
                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
          </AnimatedSurface>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = StyleSheet.create({
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 16,
    flex: 1,
  },
  confidenceBars: {
    flexDirection: 'row',
    flex: 2,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 5,
  },
});

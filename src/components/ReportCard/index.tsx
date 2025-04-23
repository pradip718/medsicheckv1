import _ from 'lodash';
import {AnimatePresence, View} from 'moti';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Card} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import {ColVal, ColorRangeItem} from '../../../types/jsons';
import {ConfidenceLevelKeys, SubParameter} from '../../../types/reports';
import {getColorForValue, getConfidenceColor} from '../../../utils/methods';
import customColor from '../../theme/customColor';
import Icon from '../Icon';
import Pressable from '../Pressable';
import ReportScale from '../ReportScale';
import ReportBlockScale from '../ReportScale/ReportBlockScale';
import CustomText from '../Text';
import SubParameters from './SubParameters';

type ReportCardProps = {
  healthMetricsTitle: string;
  healthMetricsValue: number;
  healthMetricsIndex: string;
  description: string;
  score: number;
  iconName: string;
  scaleCriteria: any;
  category: string;
  color_value: ColVal | null;
  color?: string;
  scaleType: number;
  colorRange: ColorRangeItem[];
  subParameters: SubParameter[];
  onDetailsPress: () => void;
  readingId: string;
  confidenceLevel: ConfidenceLevelKeys | null;
};

const ConfidenceLevel = React.memo(({level}: {level: ConfidenceLevelKeys}) => {
  const {languages} = useLanguageStore();
  return (
    <View style={styles({color: ''}).confidenceRow}>
      <CustomText className="text-sm font-isidoraMedium w-[70%]">
        {languages?.confidence_level}
      </CustomText>
      <View style={styles({color: ''}).confidenceBars}>
        {getConfidenceColor(level).map((color, index) => (
          <View
            key={index}
            style={[
              styles({color: ''}).confidenceBar,
              {backgroundColor: color},
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const ReportCard = React.memo((props: ReportCardProps) => {
  const {languages} = useLanguageStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const {
    healthMetricsTitle,
    healthMetricsValue,
    healthMetricsIndex,
    description,
    score,
    iconName,
    category,
    color_value,
    onDetailsPress,
    scaleCriteria,
    scaleType,
    colorRange,
    subParameters,
    readingId,
    confidenceLevel,
    color,
  } = props;

  const imageUrl =
    languages.vitals_with_image?.[
      iconName as keyof typeof languages.vitals_with_image
    ];

  useEffect(() => {
    if (imageUrl) {
      Image.prefetch(imageUrl)
        .then(() => setImageLoaded(true))
        .catch(error => console.error('Error prefetching image:', error));
    }
  }, [imageUrl]);

  const subParameterTitles = useMemo(
    () => _.map(subParameters, 'vital_key'),
    [subParameters],
  );
  const lastIndex = subParameterTitles.length - 1;

  const formattedTitles = useMemo(
    () =>
      subParameterTitles.map((title, idx) => {
        if (!title) return '';
        if (idx === lastIndex - 1) return `${title} and `;
        else if (idx !== lastIndex) return `${title}, `;
        return title;
      }),
    [subParameterTitles, lastIndex],
  );

  let selectedColor = useMemo(
    () =>
      colorRange
        ? getColorForValue(healthMetricsValue, colorRange || [])
        : '#000',
    [healthMetricsValue, colorRange],
  );

  if (color) {
    selectedColor = color;
  }

  const highlightedColor =
    selectedColor || color_value?.Default?.[iconName]?.[category] || 'gray';

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <Card
      className="py-4 bg-white"
      elevation={5}
      style={styles({color: highlightedColor}).card}>
      <View className="px-4">
        <View className="flex-row items-center">
          <View className="flex-row gap-x-4 items-center flex-1">
            <View
              className="rounded-2xl w-[50px] h-[50px] justify-center items-center"
              style={{backgroundColor: highlightedColor}}>
              {imageUrl ? (
                imageLoaded ? (
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    resizeMode="contain"
                    className="h-8 w-8"
                  />
                ) : (
                  <ActivityIndicator size="small" color={customColor.white} />
                )
              ) : (
                <Icon name={iconName} size={30} color={customColor.white} />
              )}
            </View>
            <View className="flex-1">
              <CustomText className="text-sm font-isidoraSemiBold ">
                {healthMetricsTitle}
              </CustomText>
              <CustomText className="text-2xl font-isidoraSemiBold grow">
                {healthMetricsValue}{' '}
                <CustomText className="text-base font-isidoraSemiBold">
                  {healthMetricsIndex}
                </CustomText>
              </CustomText>
            </View>
          </View>

          <View>
            {!!category && (
              <View
                className="py-2 px-2 rounded-xl items-center"
                style={{backgroundColor: highlightedColor}}>
                <CustomText className="rounded-2xl text-white text-sm font-isidoraBold">
                  {category}
                </CustomText>
              </View>
            )}
            {!!onDetailsPress && (
              <TouchableOpacity
                className="mt-2 items-end"
                onPress={onDetailsPress}>
                <CustomText
                  className="underline text-orange text-xs font-isidoraSemiBold"
                  style={{color: highlightedColor}}>
                  {languages?.more_details_link_txt}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <CustomText className="mt-4 text-xs font-isidoraMedium">
          {description}
        </CustomText>
      </View>

      <View className="my-4">
        {scaleType === 11 ? (
          <ReportBlockScale
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={scaleCriteria}
            colorRange={colorRange}
            readingKey={iconName}
            // readingId={readingId}
          />
        ) : (
          <ReportScale
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={scaleCriteria}
          />
        )}
      </View>

      {!!confidenceLevel && <ConfidenceLevel level={confidenceLevel} />}

      {!!readingId && (
        <View className="px-4">
          <AnimatePresence exitBeforeEnter>
            {isOpen && (
              <View
                key="open"
                className="border rounded-3xl p-4 overflow-hidden mt-4"
                style={{borderColor: highlightedColor}}
                from={{translateY: 0, opacity: 0}}
                animate={{translateY: -10, opacity: 1}}
                exit={{opacity: 0, translateY: 0}}
                transition={{type: 'timing', duration: 100} as any}>
                <TouchableOpacity
                  className="mb-2 rounded flex-row space-x-2 self-center"
                  onPress={toggleOpen}>
                  <Icon name="chevron-up" size={16} color={highlightedColor} />
                  <CustomText style={{color: highlightedColor}}>
                    {languages?.sub_parameters}
                  </CustomText>
                </TouchableOpacity>
                {subParameters?.map((param, idx) => (
                  <View key={`${param?.vital_key}-${idx}`} className="mt-2">
                    <SubParameters parameter={param} readingId={readingId} />
                  </View>
                ))}
              </View>
            )}
            {!isOpen && subParameters.length > 0 && (
              <View className="flex-row justify-between" key="not-open">
                <Pressable
                  onPress={toggleOpen}
                  from={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  transition={{type: 'timing', duration: 100} as any}>
                  <View className="mb-2 border border-[#01A35F] p-2 rounded flex-row space-x-2">
                    <Icon name="chevron-down" size={16} color={'#01A35F'} />
                    <CustomText className="text-[#01A35F]">
                      {languages?.sub_parameters}
                    </CustomText>
                  </View>
                </Pressable>
                <View className="w-6/12 flex-row justify-end flex-wrap">
                  {formattedTitles.map((title, idx) => (
                    <CustomText
                      key={idx}
                      className="text-sm font-isidoraSemiBold text-midnightBlue">
                      {title}
                    </CustomText>
                  ))}
                </View>
              </View>
            )}
          </AnimatePresence>
        </View>
      )}
    </Card>
  );
});

export default ReportCard;

const styles = ({}: {color?: string}) =>
  StyleSheet.create({
    card: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6.65,
      elevation: 8,
    },
    confidenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
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

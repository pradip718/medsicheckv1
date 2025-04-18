import _ from 'lodash';
import {View} from 'moti';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Tooltip} from 'react-native-paper';
import {ColorRangeItem, Config, ReportScaleRange} from '../../../types/jsons';
import {useGetUserReadingDetail} from '../../hooks/api/readings';
import Icon from '../Icon';
import CustomText from '../Text';

interface ReportBlockScaleProps {
  min: number;
  max: number;
  value: number;
  total: number;
  scaleCriteria: {
    scale: Pick<Config, 'scale'>;
    measuredValue: number;
  };
  name?: string;
  readingKey?: string;
  colorRange: ColorRangeItem[];
  pointerAdjustment?: number;
  // readingId: string;
}

const ReportBlockScale = ({
  colorRange,
  // readingId,
  scaleCriteria,
  name,
  readingKey,
  pointerAdjustment = 14,
}: ReportBlockScaleProps) => {
  // const {data: userReading} = useGetUserReadingDetail({
  //   reading_id: readingId || '',
  //   enabled: false,
  // });

  const scaleValueMapping = {
    Low: 1,
    Baja: 1,
    Bajo: 1,
    Moderate: 2,
    Moderado: 2,
    Moderada: 2,
    High: 3,
    Alto: 3,
    Alta: 3,
  };
  // const scaleValueMapping = userReading?.scale_value_mapping;
  let {measuredValue: value} = scaleCriteria;
  if (scaleValueMapping) {
    value = scaleValueMapping[value] || value;
  }

  const calculateBoxHeight = (range?: ReportScaleRange, map?: number) => {
    if (range) {
      if (
        range[0] != null &&
        range[1] != null &&
        typeof range[0] === 'number' &&
        typeof range[1] === 'number'
      ) {
        const [rangeMin, rangeMax] = range;
        const isInRange = value >= rangeMin && value <= rangeMax;
        return isInRange ? 16 : 8;
      }
      if (typeof range[0] === 'string') {
        const comparison = range[0].charAt(0);
        const rangeValue = range[0].substring(1);
        if (
          (comparison === '>' && value > +rangeValue) ||
          (comparison === '<' && value < +rangeValue)
        ) {
          return 16;
        } else {
          return 8;
        }
      }
    } else if (map != null) {
      const isMapped = value === map;
      return isMapped ? 16 : 8;
    }
  };

  const calculateMargin = (range?: ReportScaleRange, map?: number) => {
    if (range) {
      if (
        range[0] != null &&
        range[1] != null &&
        typeof range[0] === 'number' &&
        typeof range[1] === 'number'
      ) {
        const [rangeMin, rangeMax] = range;
        const totalRange = rangeMax - rangeMin;
        const distanceFromMin = value - rangeMin;
        const percentFromMin = (distanceFromMin / totalRange) * 100;
        return percentFromMin - pointerAdjustment;
      }
      if (typeof range[0] === 'string') {
        const comparison = range[0].charAt(0);
        const rangeValue = range[0].substring(1);
        if (comparison === '>') {
          return ((value - +rangeValue) / +rangeValue) * 100;
        }
      }
    } else if (map != null) {
      return map * 20 - pointerAdjustment; // Assume equally spaced maps
    }
    return 0;
  };

  const isInRange = (colorItem: ColorRangeItem) => {
    if (colorItem.range) {
      if (
        colorItem.range[0] !== null &&
        colorItem.range[1] !== null &&
        typeof colorItem.range[0] === 'number' &&
        typeof colorItem.range[1] === 'number'
      ) {
        return value >= colorItem.range[0] && value <= colorItem.range[1];
      }
      if (typeof colorItem.range[0] === 'string') {
        const comparison = colorItem.range[0].charAt(0);
        const rangeValue = colorItem.range[0].substring(1);
        if (comparison === '>') {
          return value > +rangeValue;
        }
        if (comparison === '<') {
          return value < +rangeValue;
        }
      }
    } else if (colorItem.map != null) {
      return value === colorItem.map;
    }
  };

  const formatValue = (val: number, key?: string) => {
    const noDecimal = [
      'PULSE_RATE',
      'RESPIRATION_RATE',
      'OXYGEN_SATURATION',
      'BLOOD_PRESSURE',
      'STRESS_INDEX',
      'SDNN',
      'MEAN_RRI',
      'RMSSD',
      'SD1',
      'SD2',
    ];
    const oneDecimal = ['PRQ', 'PNS_INDEX', 'SNS_INDEX', 'LFHF', 'HEMOGLOBIN'];
    const twoDecimal = ['HEMOGLOBIN_A1C'];

    if (key && noDecimal.includes(key)) {
      return _.round(val).toString();
    }
    if (key && oneDecimal.includes(key)) {
      return _.round(val, 1).toFixed(1);
    }
    if (key && twoDecimal.includes(key)) {
      return _.round(val, 2).toFixed(2);
    }
    return val.toString();
  };

  const getTitle = (colorItem: ColorRangeItem): string => {
    if (colorItem.range) {
      if (_.isNumber(colorItem.range[0]) && _.isNumber(colorItem.range[1])) {
        return `${formatValue(colorItem.range[0], readingKey)} - ${formatValue(
          colorItem.range[1],
          readingKey,
        )}`;
      }
      if (_.isString(colorItem.range[0]) && _.isNumber(colorItem.range[1])) {
        return `${colorItem.range[0]} - ${formatValue(
          colorItem.range[1],
          readingKey,
        )}`;
      }
      if (_.isNumber(colorItem.range[0]) && _.isString(colorItem.range[1])) {
        return `${formatValue(colorItem.range[0], readingKey)} - ${
          colorItem.range[1]
        }`;
      }
      if (_.isString(colorItem.range[0]) && _.isString(colorItem.range[1])) {
        return `${colorItem.range[0]} - ${colorItem.range[1]}`;
      }
      if (_.isString(colorItem.range[0])) {
        return colorItem.range[0];
      }
    } else if (colorItem.category) {
      return colorItem.category;
    }
    return '';
  };

  if (colorRange && !Array.isArray(colorRange)) {
    return <></>;
  }

  console.log('asdas', colorRange);

  return (
    <View
      className="flex-row items-end px-2 overflow-hidden"
      style={styles.container}>
      {_.isArray(colorRange) &&
        colorRange?.map((colorItem, index) => (
          <View key={`${colorItem?.color}-${index}`} className="flex-1">
            <Tooltip title={getTitle(colorItem)} enterTouchDelay={10}>
              <>
                {isInRange(colorItem) && colorItem.range && (
                  <View
                    style={{
                      marginLeft: calculateMargin(colorItem?.range) + '%',
                    }}
                    className="min-w-[100]">
                    {!!name && (
                      <CustomText className="font-isidoraMedium text-sm">
                        {name}
                      </CustomText>
                    )}
                    <Icon name="marker" size={14} color={colorItem.color} />
                  </View>
                )}

                <View
                  style={{
                    height: calculateBoxHeight(colorItem.range, colorItem.map),
                    backgroundColor: colorItem.color,
                  }}
                />
                {isInRange(colorItem) && (
                  <CustomText
                    className="flex-nowrap absolute top-8 min-w-[100]"
                    style={{
                      color: colorItem.color,
                    }}>
                    {getTitle(colorItem)}
                  </CustomText>
                )}
              </>
            </Tooltip>
          </View>
        ))}
    </View>
  );
};

export default ReportBlockScale;

const styles = StyleSheet.create({
  container: {},
  iconContainer: {},
});

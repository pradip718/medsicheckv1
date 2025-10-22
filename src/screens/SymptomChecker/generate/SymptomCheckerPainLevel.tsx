import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  runOnUI,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {RouteProp, useRoute} from '@react-navigation/native';
import Icon from '../../../components/Icon';
import {
  EMOTION_BACKGROUND_SHADES,
  EMOTION_BORDER_SHADES,
  EMOTION_ICON_COLORS,
} from '../../../constants/Colors';
import {MainStackParamList} from '../../../../types/navigation';
import {isSpanishLocale} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import CustomText from '../../../components/Text';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import {BOLD, SEMIBOLD} from '../../../constants/Fonts';
import {color, units} from '../../../theme';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

interface MoodItemProps {
  icon: string;
  label: string;
  index: number;
  scrollX: SharedValue<number>;
}

const {width} = Dimensions.get('screen');
const _iconWidth = width * 0.45;
const _iconHeight = _iconWidth * 1.25;
const _spacing = 16;

function PainLevelItem({icon, label, index, scrollX}: MoodItemProps) {
  const color = EMOTION_ICON_COLORS[index % EMOTION_ICON_COLORS.length];
  const backgroundColor =
    EMOTION_BACKGROUND_SHADES[index % EMOTION_BACKGROUND_SHADES.length];
  const borderColor =
    EMOTION_BORDER_SHADES[index % EMOTION_BORDER_SHADES.length];

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollX.value,
          [index - 1, index, index + 1],
          [1, 1.6, 1],
        ),
      },
    ],
    color: interpolateColor(
      scrollX.value,
      [index - 1, index, index + 1],
      ['#D1D5DB', color, '#D1D5DB'],
    ),
    backgroundColor: interpolateColor(
      scrollX.value,
      [index - 1, index, index + 1],
      ['#fff', backgroundColor, '#fff'],
    ),
    borderColor: interpolateColor(
      scrollX.value,
      [index - 1, index, index + 1],
      ['#fff', borderColor, '#fff'],
    ),
    borderRadius: interpolate(
      scrollX.value,
      [index - 1, index, index + 1],
      [1, 200, 1],
    ),
    borderWidth: interpolate(
      scrollX.value,
      [index - 1, index, index + 1],
      [1, 8, 1],
    ),
  }));

  const animatedIconStyles = useAnimatedStyle(() => ({
    // transform: [
    //   {
    //     scale: interpolate(
    //       scrollX.value,
    //       [index - 1, index, index + 1],
    //       [1, 1.6, 1],
    //     ),
    //   },
    // ],
    color: interpolateColor(
      scrollX.value,
      [index - 1, index, index + 1],
      ['#D1D5DB', color, '#D1D5DB'],
    ),
  }));

  const labelAnimatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
    ),
  }));

  return (
    <View style={styles.moodContainer}>
      <View style={styles.pointerContainer}>
        <AnimatedIcon
          name="down-filled"
          size={20}
          color={color}
          style={labelAnimatedStyles}
        />
      </View>

      <View
        style={[
          styles.iconContainer,
          {width: _iconWidth, height: _iconHeight},
        ]}>
        <Animated.View style={animatedStyles}>
          <AnimatedIcon name={icon} size={120} style={animatedIconStyles} />
        </Animated.View>
      </View>

      <View style={styles.pointerContainer}>
        <AnimatedIcon
          name="up-filled"
          size={20}
          color={color}
          style={labelAnimatedStyles}
        />
      </View>

      <View style={styles.labelContainer}>
        <Animated.Text style={[styles.moodLabel, labelAnimatedStyles]}>
          {label}
        </Animated.Text>
      </View>
    </View>
  );
}

const SymptomCheckerPainLevel = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomPainLevel'>>();

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const flatListRef = useRef<FlatList>(null);

  const [visibleIndex, setVisibleIndex] = useState<number>(0);
  const [loadingChoice, setLoadingChoice] = useState<string>('');

  const moodOptions = isSpanish ? spanishChoices : englishChoices;

  const moods = useMemo(
    () => [
      {icon: 'depressed', label: moodOptions[5]},
      {icon: 'sad', label: moodOptions[4]},
      {icon: 'neutral', label: moodOptions[3]},
      {icon: 'happy', label: moodOptions[2]},
      {icon: 'overjoyed', label: moodOptions[1]},
    ],
    [moodOptions],
  );

  useEffect(() => {
    const getInitialIndex = () => {
      if (params?.user_eng_choices || params?.user_spanish_choices) {
        const selected =
          params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
        const enChoices = JSON.parse(params?.eng_choices || '');
        const esChoices = JSON.parse(params?.spanish_choices || '');
        const options = isSpanish ? esChoices : enChoices;
        const selectedIndex = [...options].reverse().indexOf(selected);

        return selectedIndex > 0 && selectedIndex <= options.length - 2
          ? selectedIndex
          : 3;
      }

      return 3;
    };

    const index = getInitialIndex();
    const offset = index * (_iconWidth + _spacing);

    setVisibleIndex(index);

    //added this fix for animation/ui glitch on ios
    requestAnimationFrame(() => {
      if (flatListRef.current && index !== -1) {
        flatListRef.current?.scrollToOffset({offset, animated: false});

        setTimeout(() => {
          runOnUI(() => {
            scrollX.value = index + 0.0001;
          })();

          setTimeout(() => {
            runOnUI(() => {
              scrollX.value = index;
            })();
          }, 10);
        }, 20);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, isSpanish]);

  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(e => {
    const positionOffset = e.contentOffset.x / (_iconWidth + _spacing);
    scrollX.value = positionOffset;
    const index = Math.round(positionOffset);
    runOnJS(setVisibleIndex)(index);
  });

  const onNext = () => {
    setLoadingChoice('yes');
    const reversedEnChoices = [...englishChoices].reverse();
    const reversedEsChoices = [...spanishChoices].reverse();
    const englishChoice = reversedEnChoices[visibleIndex];
    const spanishChoice = reversedEsChoices[visibleIndex];

    onSubmit({
      eng_choices: englishChoice,
      spanish_choices: spanishChoice,
      questionData,
      // isFromReportList: params?.isFromReportList || false,
    });
  };

  const onNoSelect = () => {
    setLoadingChoice('no');

    onSubmit({
      eng_choices: englishChoices[0],
      spanish_choices: spanishChoices[0],
      questionData,
    });
  };

  return (
    <SymptomCheckerWrapper
      onNext={onNext}
      footer={
        // <Button
        //   text={moodOptions[0]}
        //   rightIcon={
        //     <Icon name="x" size={14} color={isLoading ? '#D1D5DB' : '#fff'} />
        //   }
        //   onPress={onNoSelect}
        //   disabled={isLoading}
        //   isLoading={loadingChoice === 'no'}
        // />
        <TouchableOpacity
          className="border border-gray-300 min-w-[50%] min-h-12 justify-center items-center mt-4 px-4 py-2 mb-4 flex-row"
          onPress={onNoSelect}
          style={{borderRadius: units.scale(100)}}
          disabled={isLoading}>
          {loadingChoice === 'no' && (
            <ActivityIndicator
              size={14}
              color={color.black}
              style={styles.loaderStyle}
            />
          )}
          <CustomText className="font-isidoraSemiBold text-lg">
            {moodOptions[0]}
          </CustomText>
        </TouchableOpacity>
      }
      disabled={isLoading}
      isLoading={loadingChoice === 'yes'}
      isEdit={params?.isEdit}
      questionId={questionData?.q_id}>
      <View className="px-4" style={{paddingTop: SYMPTOM_CHECKER_SPACING}}>
        <SymptomCheckerQuestion data={questionData} />
      </View>
      <View style={styles.contentContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={moods}
          keyExtractor={item => item.label}
          horizontal
          snapToInterval={_iconWidth + _spacing}
          decelerationRate="fast"
          contentContainerStyle={{
            gap: _spacing,
            paddingHorizontal: (width - _iconWidth - 20) / 2,
          }}
          renderItem={({item, index}) => (
            <PainLevelItem {...item} index={index} scrollX={scrollX} />
          )}
          onScroll={onScroll}
          scrollEventThrottle={1000 / 60}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
        />
      </View>
    </SymptomCheckerWrapper>
  );
};
export default SymptomCheckerPainLevel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
  },
  homeButton: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 6,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    flex: 1,
    marginVertical: 20,
  },
  title: {
    fontFamily: BOLD,
    fontSize: 20,
    lineHeight: 30,
    marginBottom: 60,
    marginHorizontal: 16,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  moodLabel: {
    fontSize: 20,
    fontFamily: SEMIBOLD,
    color: '#4B5363',
  },
  nextButton: {
    marginHorizontal: 16,
  },
  pointerContainer: {
    alignSelf: 'center',
  },
  moodContainer: {
    flex: 1,
    marginTop: 40,
  },
  loaderStyle: {
    marginHorizontal: 4,
  },
});

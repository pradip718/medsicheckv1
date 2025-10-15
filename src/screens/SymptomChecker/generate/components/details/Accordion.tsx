import React from 'react';
import {StyleSheet, View, Pressable, Text} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import {BOLD, REGULAR} from '../../../../../constants/Fonts';

interface AccordionItemProps {
  isExpanded: SharedValue<boolean>;
  viewKey?: string;
  content: React.ReactNode;
  duration?: number;
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

function AccordionItem({
  isExpanded,
  viewKey,
  duration = 250,
  content,
}: AccordionItemProps) {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    }),
  );
  const contentStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <View style={styles.accordionItem}>
      <Animated.View
        key={`accordionItem_${viewKey}`}
        style={[styles.animatedView, contentStyle]}>
        <View
          onLayout={e => {
            height.value = e.nativeEvent.layout.height;
          }}
          style={styles.wrapper}>
          {content}
        </View>
      </Animated.View>
    </View>
  );
}

export default function SymptomCheckerAccordion({
  title,
  children,
  isOpen = false,
}: AccordionProps) {
  const open = useSharedValue(isOpen);
  const onPress = () => {
    open.value = !open.value;
  };

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(open.value ? '180deg' : '0deg', {
            duration: 250,
          }),
        },
      ],
    };
  });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.trigger}>
        <View style={styles.triggerTitle}>
          <Text style={styles.triggerText}>{title}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Animated.View style={chevronStyle}>
            <Feather name="chevron-down" size={28} color="#4B5363" />
          </Animated.View>
        </View>
      </View>

      <View style={styles.content}>
        <AccordionItem
          isExpanded={open}
          viewKey="Accordion"
          content={children}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  triggerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerText: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    flexWrap: 'wrap',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accordionItem: {
    width: '100%',
  },
  wrapper: {
    width: '100%',
    position: 'absolute',
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden',
  },
  contentText: {
    fontFamily: REGULAR,
    fontSize: 15,
    color: '#4B5363',
    paddingTop: 8,
    lineHeight: 24,
  },
  chevronContainer: {
    height: 35,
    width: 35,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

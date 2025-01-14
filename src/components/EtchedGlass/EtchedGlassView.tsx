import {BlurView} from '@react-native-community/blur';
import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Card} from 'react-native-paper';
import {twMerge} from 'tailwind-merge';

interface EtchedGlassViewProps {
  hasLinearGradient?: boolean;
  rootClassName?: string;
  cardContentClassName?: string;
  cardContentContainerClassName?: string;
}

const EtchedGlassView = ({
  children,
  hasLinearGradient,
  rootClassName,
  cardContentClassName,
}: PropsWithChildren<EtchedGlassViewProps>) => {
  return (
    <View
      className={twMerge(
        'rounded-3xl shadow-black bg-transparent overflow-hidden flex-1 border border-slate-100',
        rootClassName,
      )}
      style={styles.card}
      //@ts-ignore
    >
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={4}
        reducedTransparencyFallbackColor="white"
        overlayColor="rgba(255,255,255,0.5)"
      />
      {hasLinearGradient ? (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0)']}
          className="px-4 pb-10 pt-4">
          <View className="px-4 pb-10 pt-4">
            <Card.Content>{children}</Card.Content>
          </View>
        </LinearGradient>
      ) : (
        <View className={cardContentClassName}>{children}</View>
      )}
    </View>
  );
};

export default EtchedGlassView;

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  card: {
    shadowColor: 'rgba(0,0,0,0.6)',
    elevation: 10,
  },
});

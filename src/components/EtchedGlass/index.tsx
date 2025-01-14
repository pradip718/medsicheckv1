import React, {PropsWithChildren} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Card} from 'react-native-paper';

interface EtchedGlassProps {
  hasLinearGradient?: boolean;
  className?: string;
  cardContentClassName?: string;
  cardContentContainerClassName?: string;
  containerStyle?: StyleProp<ViewStyle> | undefined;
}

const EtchedGlass = ({
  children,
  hasLinearGradient,
  className,
  cardContentClassName,
  cardContentContainerClassName,
  containerStyle,
}: PropsWithChildren<EtchedGlassProps>) => {
  return (
    <View
      className={`rounded-3xl border border-slate-200 overflow-hidden  ${className}`}
      style={[styles.card, containerStyle]}>
      <View style={styles.blurView} />
      {hasLinearGradient ? (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0)']}
          className="px-4 pb-10 pt-4">
          <View className="px-4 pb-10 pt-4">
            <Card.Content>{children}</Card.Content>
          </View>
        </LinearGradient>
      ) : (
        <View className={`px-4 pb-10 pt-4 ${cardContentContainerClassName}`}>
          <Card.Content className={cardContentClassName}>
            {children}
          </Card.Content>
        </View>
      )}
    </View>
  );
};

export default EtchedGlass;

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,.6)',
  },
  card: {
    shadowColor: 'rgba(0,0,0,0.6)',
  },
});

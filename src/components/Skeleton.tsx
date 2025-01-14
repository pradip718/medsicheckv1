// import {Skeleton} from 'moti/skeleton';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import Metrics from '../../utils';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

export const Spacer = ({height = 16}) => <View style={{height}} />;

export const ReportSkeleton = () => (
  <View className="items-center justify-center">
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={40}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={36} />
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={20} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={20} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={20} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={20} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
  </View>
);

export const QuestionnaireSkeleton = () => (
  <View className="items-center justify-center">
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={80}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={10} />
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={300}
      shimmerStyle={[styles.shimmerStyle]}
    />

    <Spacer height={40} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={80}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={10} />
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={100}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={40} />

    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={80}
      shimmerStyle={[styles.shimmerStyle]}
    />
    <Spacer height={10} />
    <ShimmerPlaceHolder
      width={Metrics.screenWidth - 50}
      height={200}
      shimmerStyle={[styles.shimmerStyle]}
    />
  </View>
);

export const styles = StyleSheet.create({
  shimmerStyle: {
    borderRadius: 10,
  },
});

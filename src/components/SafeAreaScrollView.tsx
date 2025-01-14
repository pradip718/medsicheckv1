import React, {PropsWithChildren} from 'react';
import {SafeAreaView, ScrollView, ScrollViewProps} from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import {ErrorFallback} from './ErrorFallback';

interface SafeAreaScrollViewProps extends ScrollViewProps {}

const SafeAreaScrollView = (
  props: PropsWithChildren<SafeAreaScrollViewProps>,
) => {
  const {children} = props;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaView>
        <ScrollView {...props}>{children}</ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default SafeAreaScrollView;

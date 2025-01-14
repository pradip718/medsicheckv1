import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import {SafeAreaViewProps} from 'react-native-safe-area-context';
import {ErrorFallback} from './ErrorFallback';

interface BasicContainerProps extends SafeAreaViewProps {}

const BasicContainer = (props: PropsWithChildren<BasicContainerProps>) => {
  const {children} = props;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <View {...props}>{children}</View>
    </ErrorBoundary>
  );
};

export default BasicContainer;

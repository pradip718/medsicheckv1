import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {MainStackParamList} from '../../../types/navigation';
import Navbar from '../../components/Navbar';
import ConclusionInformation from './ConclusionInformation';
import ReportViewer from './ReportViewer';

type ConclusionRouteProp = RouteProp<MainStackParamList, 'LabReportConclusion'>;

interface LabReportConclusionProps {
  route: ConclusionRouteProp;
}

const LabReportConclusion = ({route}: LabReportConclusionProps) => {
  const {params} = route;
  return (
    <SafeAreaView style={styles.container} className="h-full py-4 bg-white">
      <Navbar noBack />
      {!!params?.content?.retry && !!params?.content?.token_id ? (
        <ReportViewer
          token_id={params?.content?.token_id}
          retry={params?.content?.retry || 20}
          retryDelay={params?.content?.retryDelay || 5000}
        />
      ) : (
        <ConclusionInformation content={params?.content} />
      )}
    </SafeAreaView>
  );
};

export default LabReportConclusion;

const styles = StyleSheet.create({
  container: {},
  btnStyle: {},
});

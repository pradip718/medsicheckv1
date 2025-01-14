import _ from 'lodash';
import React, {memo, useState} from 'react';
import {ScrollView} from 'react-native';
import WebView from 'react-native-webview';
import useLanguageStore from '../../../../store/languageStore';
import EmptyScreen from '../../../components/EmptyScreen';
import FallbackScreen from '../../../components/FallbackScreen';
import {useGetAIReportDetails} from '../../../hooks/api/report';

const injectedJavaScript = `
setTimeout(function() {
  var body = document.body;
  var html = document.documentElement;
  var height = Math.max(body.scrollHeight, body.offsetHeight, 
                        html.clientHeight, html.scrollHeight, html.offsetHeight);
  window.ReactNativeWebView.postMessage(height.toString());
}, 2000); // Increased delay for content to fully load
true;
`;

const AIAnalysis = () => {
  const {languages} = useLanguageStore();
  const {data: aiReportDetails, isFetching} = useGetAIReportDetails({
    enabled: false,
  });

  const analysis = aiReportDetails?.[0]?.ai_response || '';

  const [webViewHeight, setWebViewHeight] = useState(0);

  if (isFetching) {
    return <EmptyScreen message={languages?.loading_smart_report} hideNavbar />;
  }

  if (!analysis || !_.isString(analysis)) {
    return <FallbackScreen hideNavbar />;
  }

  const handleMessage = (event: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setWebViewHeight(height); // Update the height state
  };

  return (
    <>
      <ScrollView>
        <WebView
          originWhitelist={['*']}
          source={{html: analysis}}
          scrollEnabled={false}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          style={{height: webViewHeight}}
        />
      </ScrollView>
    </>
  );
};

export default memo(AIAnalysis);

import _ from 'lodash';
import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import WebView from 'react-native-webview';
import useLanguageStore from '../../../../store/languageStore';
import {notifyApi} from '../../../api/user';
import EmptyScreen from '../../../components/EmptyScreen';
import FallbackScreen from '../../../components/FallbackScreen';
import {useGetLabReportDetails} from '../../../hooks/api/report';

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
  const {data: labReportDetails, isFetching} = useGetLabReportDetails({
    enabled: false,
  });
  const [webViewHeight, setWebViewHeight] = useState(0);

  const analysis = labReportDetails?.[0]?.ai_response || '';

  if (isFetching) {
    return <EmptyScreen message={languages?.loading_smart_report} hideNavbar />;
  }

  if (!analysis || !_.isString(analysis)) {
    notifyApi('lr_report_view_error');
    return <FallbackScreen hideNavbar />;
  }

  const handleMessage = (event: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setWebViewHeight(height); // Update the height state
  };

  return (
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
  );
};

export default AIAnalysis;

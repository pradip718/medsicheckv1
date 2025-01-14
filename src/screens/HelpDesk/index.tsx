import {NavigationProp, useNavigation} from '@react-navigation/native';
import {View, motify} from 'moti';
import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import {
  NavigationState,
  SceneMap,
  SceneRendererProps,
  TabView,
} from 'react-native-tab-view';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import CustomText from '../../components/Text';
import customColor from '../../theme/customColor';
import ClosedIssues from './ClosedIssues';
import OpenIssues from './OpenIssues';

const MotiTouchableOpacity = motify(TouchableOpacity)();
// const MotiCustomText = motify(CustomText);

interface TabRoute {
  key: string;
  title: string;
}

interface TabBarProps extends SceneRendererProps {
  navigationState: NavigationState<TabRoute>;
}

const renderScene = SceneMap({
  open_issue: OpenIssues,
  closed_issue: ClosedIssues,
});

const HelpDesk = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'open_issue', title: languages?.open_issue},
    {key: 'closed_issue', title: languages?.closed_issue},
  ]);

  const navigateToRaiseIssue = () => {
    navigation.navigate('RaiseIssue');
  };

  const _renderTabBar: React.FC<TabBarProps> = ({navigationState}) => {
    return (
      <View className="flex-row border border-cornflowerBlue rounded-full p-1 mx-6">
        {navigationState.routes.map((route, i) => {
          return (
            <MotiTouchableOpacity
              key={`${route?.key}-${i}`}
              from={{
                backgroundColor: 'white',
              }}
              animate={{
                backgroundColor:
                  i === index ? customColor.cornflowerBlue : customColor.white,
              }}
              transition={{type: 'timing', duration: 200} as any}
              className="flex-1 items-center p-2 rounded-full "
              onPress={() => setIndex(i)}>
              <CustomText>{route.title}</CustomText>
            </MotiTouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <BasicContainer className="bg-white h-full">
      <SafeAreaView className="h-full">
        <View className="p-4">
          <Navbar />
        </View>
        <View className="mt-4 flex-1">
          <CustomText className="text-2xl font-isidoraBold text-ultramarineBlue px-6">
            {languages?.help_desk}
          </CustomText>

          <TabView
            className="mt-4 h-full"
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={_renderTabBar}
          />
          <TouchableOpacity
            activeOpacity={0.4}
            className="flex-row space-x-4 items-center self-center absolute bottom-4 bg-[#6D88F8] p-4 rounded-full z-50"
            onPress={navigateToRaiseIssue}
            style={styles.raiseIssueButton}>
            <Icon name="plus" size={20} color={customColor.white} />
            <CustomText className="font-isidoraSemiBold text-base text-white">
              {languages?.raise_issue}
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default HelpDesk;

const styles = StyleSheet.create({
  raiseIssueButton: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

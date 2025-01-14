import {MotiView} from 'moti';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import useLanguageStore, {Language} from '../../../store/languageStore';
import usePersistLocalStore from '../../../store/persistLocalStore';
import useWalkthroughStore, {
  WalkthroughKey,
} from '../../../store/walkthroughStore';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import CustomText from '../Text';

const getLanguageBasedOnOrder = (key: WalkthroughKey, languages: Language) => {
  switch (key) {
    case 'scan_button':
      return languages?.walkthrough_scan_button;
    case 'menu_button':
      return languages?.walkthrough_menu_button;
    case 'drawer_button':
      return languages?.walkthrough_drawer_button;
    case 'view_report':
      return languages?.walkthrough_view_report;
    case 'share_report':
      return languages?.walkthrough_share_report;
    case 'report_history':
      return languages?.walkthrough_report_history;
    case 'dashboard_personalised_report':
      return languages?.walkthrough_dashboard_personalised_report;
    default:
      return '';
  }
};

const CustomWalkthrough = ({name}: {name: WalkthroughKey}) => {
  const {languages} = useLanguageStore();
  const {
    walkthroughs,
    showNextWalkthrough,
    showPreviousWalkthrough,
    isFirstWalkthrough,
    isLastWalkthrough,
    endWalkthrough,
    currentWalkthroughScreen,
  } = useWalkthroughStore();

  const {setUserVisitedWalkthrough} = usePersistLocalStore();
  const {data: userAttributes} = useGetUserAttributes();

  const order = walkthroughs?.[currentWalkthroughScreen]?.[name]?.order;
  const isFirst = isFirstWalkthrough(order || 1);
  const isLast = isLastWalkthrough(order || 1);

  return (
    <MotiView
      from={{translateY: -10}}
      animate={{translateY: 0}}
      transition={{
        delay: 100,
      }}>
      <CustomText className="font-isidoraSemiBold text-center text-sm">
        {getLanguageBasedOnOrder(name, languages)}
      </CustomText>
      <View className="flex-row space-x-4 justify-center mt-4">
        <TouchableOpacity
          disabled={isFirst}
          className={`min-w-[80] p-2 text-white rounded-2xl justify-center items-center
           ${isFirst ? 'bg-slate-300' : 'bg-blueBerry'}`}
          onPress={() => showPreviousWalkthrough(order || 1)}>
          <CustomText className="text-white font-isidoraSemiBold">
            {languages?.previous}
          </CustomText>
        </TouchableOpacity>
        {!isLast ? (
          <TouchableOpacity
            activeOpacity={0}
            disabled={isLast}
            className={`min-w-[80] p-2 text-white rounded-2xl justify-center items-center
           ${isLast ? 'bg-slate-300' : 'bg-blueBerry'}`}
            onPress={() => showNextWalkthrough(order || 1)}>
            <CustomText className="text-white font-isidoraSemiBold">
              {languages?.next}
            </CustomText>
          </TouchableOpacity>
        ) : (
          <></>
        )}

        <TouchableOpacity
          activeOpacity={0}
          className="min-w-[80] p-2 text-white rounded-2xl justify-center items-center bg-blueBerry"
          onPress={() => {
            endWalkthrough(currentWalkthroughScreen);
            if (userAttributes?.user_id) {
              setUserVisitedWalkthrough(userAttributes?.user_id);
            }
          }}>
          <CustomText className="text-white font-isidoraSemiBold">
            {isLast ? languages?.finish : languages?.skip}
          </CustomText>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export default CustomWalkthrough;

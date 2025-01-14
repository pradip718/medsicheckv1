import React from 'react';
// import {View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import EtchedGlass from '../../../components/EtchedGlass';
import CustomText from '../../../components/Text';
// import RenderProgressBar from './RenderProgressBar';

const RenderInformationCard = ({
  fakeRecording,
  progress,
  didFinishedMeasuring,
}: {
  fakeRecording: boolean;
  didFinishedMeasuring: boolean;
  progress: number;
}) => {
  const {languages} = useLanguageStore();
  if (didFinishedMeasuring) {
    return <></>;
  }

  return fakeRecording ? (
    progress < 0.3 ? (
      <EtchedGlass
        className=" rounded-xl p-0"
        cardContentClassName="p-0"
        cardContentContainerClassName="px-2 py-4">
        <CustomText className="text-center text-black text-base font-isidoraSemiBold">
          {languages?.during_recording_title}
        </CustomText>
        <CustomText className="text-center text-black text-xs font-isidoraMedium mt-2">
          {languages?.during_recording_msg}
        </CustomText>
      </EtchedGlass>
    ) : (
      <></>
    )
  ) : (
    <EtchedGlass
      className=" rounded-xl p-0"
      cardContentClassName="p-0"
      cardContentContainerClassName="px-2 py-4">
      <CustomText className="text-center text-black text-base font-isidoraSemiBold">
        {languages?.initiate_recording_title}
      </CustomText>
      <CustomText className="text-center text-black text-xs font-isidoraMedium mt-2">
        {languages?.initiate_recording_msg}
      </CustomText>
    </EtchedGlass>
  );
};

export default RenderInformationCard;

import React from 'react';
import useAlertStore from '../../../../store/alertStore';
import useLanguageStore from '../../../../store/languageStore';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';

const StopButton = ({restartSession}: {restartSession: () => void}) => {
  const {languages} = useLanguageStore();
  const {showAlert, hideAlert} = useAlertStore();

  const handleStop = () => ({
    onOkPressed: () => {
      restartSession();
      hideAlert();
    },
    onCancelPressed: hideAlert,
  });

  const confirmStop = () => {
    showAlert(
      {
        title: languages?.stop_scan_title,
        content: languages?.stop_scan_description,
      },
      handleStop(),
    );
  };

  return (
    <Pressable
      className="border border-slate-300 px-20 py-2 rounded-2xl bg-red-600"
      onPress={confirmStop}>
      <CustomText className="text-white font-isidoraSemiBold text-lg">
        {languages?.stop_scan_button_txt}
      </CustomText>
    </Pressable>
  );
};

export default StopButton;

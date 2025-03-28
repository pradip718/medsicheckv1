import React from 'react';
import Tooltip, {TooltipProps} from 'react-native-walkthrough-tooltip';
import useLanguageStore from '../../../store/languageStore';
import useWalkthroughStore, {
  WalkthroughKey,
} from '../../../store/walkthroughStore';
import CustomWalkthrough from './CustomWalkthrough';

interface ToolTipWalkthroughProps extends TooltipProps {
  children: React.ReactNode;
  walkthroughName: WalkthroughKey;
}

const ToolTipWalkthrough = ({
  children,
  walkthroughName,
  ...restProps
}: ToolTipWalkthroughProps) => {
  const {languages} = useLanguageStore();
  const {walkthroughs, currentWalkthroughScreen} = useWalkthroughStore();
  const visible =
    walkthroughs?.[currentWalkthroughScreen]?.[walkthroughName]?.visible ||
    false;

  if (languages?.showWalkthrough?.toLocaleLowerCase() !== 'true') {
    return children;
  }

  return (
    <Tooltip
      isVisible={visible}
      content={<CustomWalkthrough name={walkthroughName} />}
      // eslint-disable-next-line react-native/no-inline-styles
      contentStyle={{
        height: 'auto',
      }}
      closeOnBackgroundInteraction={false}
      closeOnChildInteraction={false}
      allowChildInteraction={false}
      useInteractionManager={true}
      {...restProps}>
      {children}
    </Tooltip>
  );
};

export default ToolTipWalkthrough;

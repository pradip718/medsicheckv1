import {entries} from 'lodash';
import {AnimatePresence, ScrollView, View} from 'moti';
import React, {useState} from 'react';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import Icon from '../../components/Icon';
import Pressable from '../../components/Pressable';
import CustomText from '../../components/Text';
import customColor from '../../theme/customColor';
import {IssuePriorityType} from './type';

const IssuePriority = ({
  selectedPriority,
  onChangePriority,
}: {
  selectedPriority: IssuePriorityType;
  onChangePriority: (txt: IssuePriorityType) => void;
}) => {
  const {languages} = useLanguageStore();
  const issue_priorities: Record<IssuePriorityType, string> =
    languages?.issue_priorities?.priorities;

  const [isOpen, setIsOpen] = useState(false);

  const onSelectItem = (priorityKey: string) => {
    const key = priorityKey as IssuePriorityType;
    if (Object.keys(issue_priorities).includes(key)) {
      onChangePriority(key);
      setIsOpen(false);
    }
  };

  return (
    <View>
      <CustomText className="font-isidoraMedium text-sm">
        {languages?.issue_priority_title}
      </CustomText>
      <Pressable
        shouldScaleOnClick={false}
        className="border border-slate-400 rounded-lg p-2 mt-2 flex-row justify-between items-center"
        onPress={() => setIsOpen(open => !open)}>
        <CustomText className="flex-1">
          {selectedPriority
            ? languages?.issue_priorities?.priorities[selectedPriority]
            : languages?.select_issue_placeholder}
        </CustomText>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={customColor.ultramarineBlue}
        />
      </Pressable>

      <AnimatePresence>
        {isOpen && (
          <View
            className="border border-t-0 border-cornflowerBlue rounded-xl overflow-hidden"
            from={{height: 0, opacity: 0}}
            animate={{height: 120, opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{type: 'timing', duration: 300} as any}>
            <ScrollView nestedScrollEnabled>
              {entries(issue_priorities).map(
                ([priorityKey, priorityValue], idx) => (
                  <Pressable
                    key={priorityKey}
                    className={twMerge(
                      'border-t px-4 border-cornflowerBlue',
                      idx === 0 && 'border-t-0',
                    )}
                    onPress={() => onSelectItem(priorityKey)}>
                    <CustomText className="font-isidoraMedium p-2">
                      {priorityValue}
                    </CustomText>
                  </Pressable>
                ),
              )}
            </ScrollView>
          </View>
        )}
      </AnimatePresence>
    </View>
  );
};

export default IssuePriority;

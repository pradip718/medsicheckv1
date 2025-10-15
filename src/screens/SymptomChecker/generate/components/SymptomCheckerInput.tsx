import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import useLanguageStore from '../../../../../store/languageStore';
import Icon from '../../../../components/Icon';
import {REGULAR} from '../../../../constants/Fonts';

interface SymptomCheckerInputProps {
  text: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  placeholder?: string;
}

const SymptomCheckerInput = ({
  text,
  onChangeText,
  maxLength = 200,
  containerStyle,
  autoFocus = false,
  placeholder,
}: SymptomCheckerInputProps) => {
  const languages = useLanguageStore(store => store.languages);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <TextInput
        value={text}
        placeholder={placeholder || languages?.text_input_placeholder}
        placeholderTextColor="#4B5363"
        onChangeText={onChangeText}
        style={styles.input}
        multiline
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
      <View style={styles.countContainer}>
        <Icon name="count" color="#9CA3AF" size={20} />
        <Text style={styles.countText}>
          {text.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};
export default SymptomCheckerInput;

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    marginTop: 28,
  },
  input: {
    textAlignVertical: 'top',
    padding: 16,
    borderRadius: 24,
    fontFamily: REGULAR,
    fontSize: 16,
    backgroundColor: '#F3F4F6',
    color: '#222A3D',
    borderCurve: 'continuous',
    height: 180,
  },
  countContainer: {
    flexDirection: 'row',
    gap: 5,
    position: 'absolute',
    right: 16,
    bottom: 8,
  },
  countText: {
    fontSize: 12,
    color: '#4B5363',
    fontFamily: REGULAR,
    lineHeight: 18,
  },
});

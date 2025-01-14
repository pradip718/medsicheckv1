import React, {useState} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AuthBackground} from '../../../../assets';
import SafeAreaScrollView from '../../../components/SafeAreaScrollView';
import NewPassword from './NewPassword';
import UserNameField from './UserNameField';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [didSendCode, setDidSendCode] = useState(false);

  const handleSendCode = (haveSendCode: boolean) => {
    setDidSendCode(haveSendCode);
  };

  const onEmailChange = (eml: string) => {
    setEmail(eml);
  };

  return (
    <LinearGradient
      colors={['#6583FF', '#3E64FF']}
      style={styles.linearGradient}>
      <ImageBackground source={AuthBackground as any} className="flex-1">
        <SafeAreaScrollView
          className="h-full"
          contentContainerStyle={styles.contentContainer}>
          {didSendCode ? (
            <NewPassword email={email} />
          ) : (
            <UserNameField
              handleSendCode={handleSendCode}
              onEmailChange={onEmailChange}
              email={email}
            />
          )}
        </SafeAreaScrollView>
      </ImageBackground>
    </LinearGradient>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  contentContainer: {flex: 1},
});

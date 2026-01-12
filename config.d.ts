declare module 'react-native-config' {
  export interface NativeConfig {
    BASE_URL?: string;
    USERPOOL_ID?: string;
    USERPOOL_CLIENT_ID?: string;
    Environment: 'production' | 'staging' | 'development';
    ACCESS_KEY_ID: string;
    SECRET_ACCESS_KEY: string;
    KMS_ARN: string;
    KMS_ALGORITHM: EncryptionAlgorithmSpec | undefined;
    MIXPANEL_TOKEN?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

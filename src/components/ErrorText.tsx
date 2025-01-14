import React from 'react';
import CustomText from './Text';

const ErrorText = ({message}: {message: string | undefined}) => {
  return message ? (
    <CustomText className="text-base font-isidoraMedium text-red-500">
      {message}
    </CustomText>
  ) : null;
};

export default ErrorText;

import React from 'react';
import {ScrollView} from 'react-native';
import useGetUserReading from '../../../hooks/api/useGetUserReading';
import PreferenceCard from './PreferenceCard';

const USER_PREFERENCES = ['PULSE_RATE', 'PRQ', 'PNS_ZONE'];

type UserPreferencesVitalProps = {
  reading_id: string;
};

const UserPreferencesVital = ({reading_id}: UserPreferencesVitalProps) => {
  const {data: reportData} = useGetUserReading({reading_id});

  const readings = reportData?.data?.readings[0]?.reading_data || {};

  const preferenceCards = USER_PREFERENCES.map(preference => {
    const reading = readings[preference];

    if (!reading) {
      return null;
    }

    return (
      <PreferenceCard
        key={preference}
        iconName={preference}
        value={reading.value}
        category={reading.category}
        score={reading.score}
      />
    );
  });

  return <ScrollView horizontal>{preferenceCards}</ScrollView>;
};

export default UserPreferencesVital;

import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export interface ListItem {
  fromCurrentUser: boolean;
  path: string;
}

export const getRecordedAudios = async (): Promise<string[]> => {
  const recordingSavingPath = Platform.select({
    ios: RNFS.DocumentDirectoryPath,
    default: RNFS.CachesDirectoryPath,
  });

  const items = await RNFS.readDir(recordingSavingPath);
  return items
    .filter(item => item.path.endsWith('.m4a'))
    .map(item => item.path);
};

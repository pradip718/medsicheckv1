import {color, units} from '../../theme';
import {fontConfig} from '../../theme/themeTypography';

/**
 * All text will start off looking like this.
 */
const BASE_VIEW = {
  paddingHorizontal: units.spacing(2),
  borderRadius: units.scale(100),
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 10,
  width: '100%',
  alignSelf: 'center',
  flexDirection: 'row',
};

const BASE_TEXT = {
  paddingHorizontal: units.spacing(3),
  fontSize: 16,
  fontFamily: fontConfig.Bold,
};

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const viewPresets: any = {
  /**
   * A smaller piece of secondard information.
   */
  primary: {...BASE_VIEW, backgroundColor: color.ultramarineBlue},

  secondary: {...BASE_VIEW, backgroundColor: color.white},

  /**
   * A button without extras.
   */
  link: {
    ...BASE_VIEW,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'flex-start',
  },
};

export const textPresets: any = {
  primary: {...BASE_TEXT, color: color.white},
  secondary: {...BASE_TEXT, color: color.accentBlue},
  link: {
    ...BASE_TEXT,
    color: color.accentBlue,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
};

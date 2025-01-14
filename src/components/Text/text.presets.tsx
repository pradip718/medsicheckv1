import {color, units} from '../../theme';

/**
 * All text will start off looking like this.
 */
const BASE = {
  color: color.black,
  fontSize: 16,
  fontFamily: 'IsidoraSans-Regular',
};

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const presets = {
  /**
   * The default text styles.
   */
  default: BASE,

  /**
   * A bold version of the default text.
   */
  bold: {...BASE},

  /**
   * Large headers.
   */
  header: {...BASE, fontSize: units.fontSize(1.06)},

  /**
   * Field labels that appear on forms above the inputs.
   */
  fieldLabel: {
    ...BASE,
    fontSize: units.fontSize(0.81),
    // color: color.dim,
  },

  /**
   * A smaller piece of secondary information.
   */
  secondary: {
    ...BASE,
    fontSize: units.fontSize(0.56),
    // color: color.dim,
  },
  largeTitle: {
    ...BASE,
    fontSize: 40,
    fontFamily: 'IsidoraSans-SemiBold',
  },
  largeTitleDescription: {
    ...BASE,
    fontSize: 24,
  },
};

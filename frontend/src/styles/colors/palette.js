import colors from './colors'

const palette = {
  primary: {
    light: colors.purple[80],
    main: colors.purple[40], // Close to #8E6CD1
    dark: colors.purple[30],
  },
  secondary: {
    light: colors.neonGreen[60],
    main: colors.neonGreen[50],  
    dark: colors.neonGreen[30],
  },
  error: {
    light: colors.red[70],
    main: colors.red[40],
    dark: colors.red[30],
  },
  warning: {
    light: colors.yellow[70],
    main: colors.yellow[60],
    dark: colors.yellow[40]
  },
  success: {
    light: colors.green[70],
    main: colors.green[50],
    dark: colors.green[30]
  },
  info: {
    light: colors.cyan[80],
    main: colors.cyan[60],
    dark: colors.cyan[40]
  },
  background: {
    default: colors.neutral[98],
    paper: colors.neutral[100]
  },
  neutral: {
    white: colors.neutral[100],
    light: colors.neutral[98],
    gray: colors.neutral[50],
    dark: colors.neutral[10],
    black: colors.neutral[0]
  },
  text: {
    primary: colors.neutral[10],
    secondary: colors.neutral[40],
    tertiary: colors.neutral[60],
    inverse: colors.neutral[95]
  }

};

export default palette;
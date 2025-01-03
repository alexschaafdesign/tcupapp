import colorTokens from './colortokens';

const palette = {
  primary: {
    light: colorTokens.primary.light, //purple
    main: colorTokens.primary.main,  
    dark: colorTokens.primary.dark,
  },
  secondary: {
    light: colorTokens.secondary.light, // red
    main: colorTokens.secondary.main,
    dark: colorTokens.secondary.dark,
  },
  error: {
    light: colorTokens.error.light, // red
    main: colorTokens.error.main,
    dark: colorTokens.error.dark,
  },
  warning: {
    light: colorTokens.warning.light,
    main: colorTokens.warning.main,
    dark: colorTokens.warning.dark,
  },
  success: {
    light: colorTokens.success.light,
    main: colorTokens.success.main,
    dark: colorTokens.success.dark,
  },
  info: {
    light: colorTokens.info.light,
    main: colorTokens.info.main,
    dark: colorTokens.info.dark,
  },
  neutral: {
    light: colorTokens.neutral.light,
    main: colorTokens.neutral.main,
    dark: colorTokens.neutral.dark,
    white: colorTokens.neutral.white,
  },
  background: {
    default: colorTokens.background.default,
    paper: colorTokens.background.paper,
  },
  text: {
    primary: colorTokens.text.primary,
    secondary: colorTokens.text.secondary,
  },
};

console.log('colorTokens:', colorTokens);
console.log('colorTokens.primary.main:', colorTokens.primary.main);

export default palette;
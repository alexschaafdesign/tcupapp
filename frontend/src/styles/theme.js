import { createTheme } from '@mui/material/styles';
import palette from './colors/palette';
import { typography } from './typography';
import { buttonStyles } from './button';
import { textFieldStyles } from './textfield';
import { components } from './components';
import { tables } from './tables'

const theme = createTheme({
  palette,
  typography,
  components: {
    ...buttonStyles,
    ...textFieldStyles,
    ...components,
    ...tables,
  },
});

export default theme;
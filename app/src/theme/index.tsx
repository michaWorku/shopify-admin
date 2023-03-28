import React, { ReactNode, useMemo } from 'react';
//material ui
import { CssBaseline, Theme } from '@mui/material';
import {
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';
import palette from './palette';
import shape from './shape';
import typography from './typography';
import components from './override'
import breakpoints from './breakpoints';

interface Props {
  children?: ReactNode;
}
const ThemeConfig = ({ children }: Props) => {
  const themeOptions:any = useMemo(
    () => ({
      palette,
      shape,
      typography,
      components,
      breakpoints
    }),
    [],
  );
  const theme: Theme = createTheme(themeOptions);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
    
  );
}



export default ThemeConfig
import { GlobalStyles as GlobalThemeStyles } from '@mui/material';

 const GlobalStyles = () => {

  return (
    <GlobalThemeStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          width: '100%',
          height: '100%',
          margin: "0",
          padding: "0",
          background: "#000000",
          color: "#FFFFFF",
          fontFamily:  "Muli, sans-serif, Arial, sans-serif, Anton",
          fontSize: "1rem !default",
          fontWeight: "normal !default",
          WebkitontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: "1.5 !default",
          letterSpacing: 0.2
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
         a: {
          textDecoration: "none",
          color: "#000"
        },
        ul: {
          listStyle: 'none'
        }
      }}
    />
  );
}

export default GlobalStyles
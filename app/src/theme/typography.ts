export const pxToRem = (value: number) => (`${value / 16}rem`) 
  
export const responsiveFontSizes = ({ sm, md, lg }: any) => {
    return {
      "@media (min-width:600px)": {
        fontSize: pxToRem(sm),
      },
      "@media (min-width:900px)": {
        fontSize: pxToRem(md),
      },
      "@media (min-width:1200px)": {
        fontSize: pxToRem(lg),
      },
    };
  }
  
const FONT_PRIMARY = "Roboto Sans, sans-serif, Anton";
  
const typography = {
    fontFamily: FONT_PRIMARY,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
        fontWeight: 900,
        lineHeight: 80 / 64,
        fontSize: pxToRem(40),
        ...responsiveFontSizes({ sm: 40, md: 48, lg: 64 }),
    },
    h2: {
        fontWeight: 900,
        lineHeight: 60 / 72,
        fontSize: pxToRem(32),
        ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
    },
    h3: {
        fontWeight: 200,
        lineHeight: 1.5,
        fontSize: pxToRem(24),
        ...responsiveFontSizes({ sm: 26, md: 36, lg: 42 }),
    },
    h4: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(20),
        ...responsiveFontSizes({ sm: 20, md: 26, lg: 30 }),
    },
    h5: {
        fontWeight: 500,
        lineHeight: 1.5,
        fontSize: pxToRem(16),
        ...responsiveFontSizes({ xs : 16, sm: 20, md: 22, lg: 22 }),
    },
    h6: {
        fontWeight: 700,
        lineHeight: 28 / 18,
        fontSize: pxToRem(14),
        ...responsiveFontSizes({ sm: 14,  md: 16, lg: 18 }),
    },
    subtitle1: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: pxToRem(16),
    },
    subtitle2: {
        fontWeight: 400,
        lineHeight: 22 / 14,
        fontSize: pxToRem(12),
    },
    body1: {
        lineHeight: 1.7,
        fontSize: pxToRem(13),
    },
    body2: {
        lineHeight: 22 / 14,
        fontSize: pxToRem(14),
    },
    caption: {
        lineHeight: 1.5,
        fontSize: pxToRem(12),
    },
    overline: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(17.5),
        letterSpacing: 1.1,
        textTransform: "uppercase",
    },
    button: {
        fontWeight: 700,
        lineHeight: 24 / 14,
        fontSize: pxToRem(14),
        textTransform: "capitalize",
    },
};

export default typography;

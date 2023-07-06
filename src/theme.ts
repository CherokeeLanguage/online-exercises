export const theme = {
  colors: {
    HARD_YELLOW: "#F2BD09",
    SOFT_YELLOW: "#E9C87E",
    LIGHTER_GRAY: "#EFEFEF",
    LIGHT_GRAY: "#D0D0D0",
    MED_GRAY: "#A2A2A2",
    DARK_RED: "#7A2022",
    LIGHTEST_RED: "#FFCED0",
    MED_GREEN: "#77CE33",
    DARK_GREEN: "#427A15",
    TEXT_GRAY: "#222222",
    WHITE: "#FFFFFF",
  },
  hanehldaColors: {
    CREAM: "#F5EBD5",
    TEXT_CREAM: "#FFEA9F",
    LIGHT_RED: "#DFBFAD",
    DARK_RED: "#98342E",
    BORDER_GRAY: "#D9D9D9",
    TEXT_LIGHT_GRAY: "#898989",
  },
  borderRadii: {
    md: "20px",
  },
  fontSizes: {
    sm: "16px",
    md: "20px",
    lg: "24px",
  },
} as const;

const sizes = {
  mobileS: "320px",
  mobileM: "375px",
  mobileL: "425px",
  tablet: "768px",
  laptop: "1024px",
  laptopL: "1440px",
  desktop: "2560px",
} as const;

export const devices = {
  mobileS: `(min-width: ${sizes.mobileS})`,
  mobileM: `(min-width: ${sizes.mobileM})`,
  mobileL: `(min-width: ${sizes.mobileL})`,
  tablet: `(min-width: ${sizes.tablet})`,
  laptop: `(min-width: ${sizes.laptop})`,
  laptopL: `(min-width: ${sizes.laptopL})`,
  desktop: `(min-width: ${sizes.desktop})`,
} as const;

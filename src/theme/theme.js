import { createTheme } from "@mui/material/styles";
import { fonts, palette, radius } from "./tokens";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.primary, light: palette.primaryLight, contrastText: "#fff" },
    secondary: { main: palette.accent, contrastText: palette.ink },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.danger },
    background: { default: palette.canvas, paper: palette.surface },
    text: { primary: palette.text, secondary: palette.textMuted, disabled: palette.textSubtle },
    divider: palette.border,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em", lineHeight: 1.2 },
    h2: { fontFamily: fonts.display, fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.015em", lineHeight: 1.25 },
    h3: { fontFamily: fonts.display, fontWeight: 600, fontSize: "1.125rem", letterSpacing: "-0.01em" },
    h4: { fontFamily: fonts.display, fontWeight: 600, fontSize: "1rem" },
    subtitle1: { fontWeight: 500, color: palette.textMuted },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.55 },
    caption: { fontSize: "0.75rem", color: palette.textMuted },
    overline: { fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.6875rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"cv11", "ss01"',
          WebkitFontSmoothing: "antialiased",
        },
        ".tabular-nums": { fontVariantNumeric: "tabular-nums" },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: palette.border },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: radius.lg, borderColor: palette.border } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: radius.sm, paddingInline: 14 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderColor: palette.border,
          color: palette.textMuted,
          paddingBlock: 6,
          "&.Mui-selected": {
            backgroundColor: palette.primaryLight,
            color: palette.primary,
            "&:hover": { backgroundColor: palette.primaryLight },
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: palette.border, fontVariantNumeric: "tabular-nums" },
        head: {
          fontWeight: 600,
          color: palette.textMuted,
          backgroundColor: palette.canvas,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: palette.ink, fontSize: "0.75rem" } },
    },
    MuiLink: { defaultProps: { underline: "hover" } },
  },
});

export default theme;

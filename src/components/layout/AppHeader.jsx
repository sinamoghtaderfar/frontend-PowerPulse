import { useState } from "react";
import { NavLink, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BrandMark from "./BrandMark";
import ApiStatus from "./ApiStatus";
import { NAV_ITEMS } from "./navigation";
import { palette } from "../../theme/tokens";

const linkSx = {
  position: "relative",
  px: 1.5,
  py: 1,
  borderRadius: 1,
  color: "rgba(255,255,255,0.72)",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
  transition: "color 150ms ease, background-color 150ms ease",
  "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
  "&:focus-visible": { outline: `2px solid ${palette.accent}`, outlineOffset: 2 },
  "&.active": { color: "#fff" },
  "&.active::after": {
    content: '""',
    position: "absolute",
    left: 12,
    right: 12,
    bottom: -13,
    height: 2,
    borderRadius: 2,
    bgcolor: palette.accent,
  },
};

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: palette.ink, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 }, gap: 2 }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="PowerPulse home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              color: "#fff",
              textDecoration: "none",
              mr: { md: 3 },
              borderRadius: 1,
              "&:focus-visible": { outline: `2px solid ${palette.accent}`, outlineOffset: 4 },
            }}
          >
            <BrandMark />
            <Typography
              component="span"
              sx={{ fontFamily: "inherit", fontWeight: 700, fontSize: "1.0625rem", letterSpacing: "-0.01em" }}
            >
              PowerPulse
            </Typography>
          </Box>

          <Box component="nav" aria-label="Main" sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <Box key={item.to} component={NavLink} to={item.to} end={item.end} sx={linkSx}>
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <ApiStatus />
          </Box>
          <IconButton
            edge="end"
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            sx={{ display: { md: "none" }, color: "#fff" }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 280, bgcolor: palette.ink, color: "#fff" } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <BrandMark />
            <Typography sx={{ fontWeight: 700 }}>PowerPulse</Typography>
          </Box>
          <IconButton aria-label="Close navigation menu" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <List component="nav" aria-label="Main" sx={{ px: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: "rgba(255,255,255,0.75)",
                "&.active": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                "&.active .MuiListItemText-primary": { fontWeight: 700 },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ p: 2, mt: "auto" }}>
          <ApiStatus />
        </Box>
      </Drawer>
    </AppBar>
  );
}

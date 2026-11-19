import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@mui/material";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import ErrorBoundary from "../ErrorBoundary";
import { LoadingState } from "../common/StateViews";

export default function AppShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
          px: 2,
          py: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppHeader />
      <Container component="main" id="main" tabIndex={-1} maxWidth="xl" sx={{ flex: 1, py: { xs: 3, md: 4 }, outline: "none" }}>
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<LoadingState label="Loading page" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Container>
      <AppFooter />
    </Box>
  );
}

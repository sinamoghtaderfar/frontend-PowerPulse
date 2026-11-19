import { Box, Container, Link, Stack, Typography } from "@mui/material";

const LINKS = [
  { label: "Frontend source", href: "https://github.com/sinamoghtaderfar/frontend-PowerPulse" },
  { label: "API source", href: "https://github.com/sinamoghtaderfar/api-Forecast-PowerPulse" },
  { label: "Data: Our World in Data", href: "https://github.com/owid/energy-data" },
];

export default function AppFooter() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper", mt: 6 }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ py: 3, alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography variant="body2" color="text.secondary">
            PowerPulse · Germany electricity generation forecasts
          </Typography>
          <Stack direction="row" spacing={2.5} useFlexGap sx={{ flexWrap: "wrap" }}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="text.secondary"
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

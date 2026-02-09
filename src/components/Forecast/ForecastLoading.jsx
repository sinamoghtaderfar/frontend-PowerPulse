import { Container, Box, Typography, CircularProgress } from "@mui/material";
import { Timeline } from "@mui/icons-material";

export default function ForecastLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          gap: 3
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ color: "primary.main", animationDuration: "800ms" }} 
        />
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Timeline /> Loading forecast data...
        </Typography>
      </Box>
    </Container>
  );
}

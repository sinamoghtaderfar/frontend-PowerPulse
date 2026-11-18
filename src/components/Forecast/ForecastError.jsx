import { Container, Alert, Typography, IconButton } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

export default function ForecastError({ message, onRetry }) {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Alert
        severity="error"
        role="alert"
        sx={{ 
          borderRadius: 2, 
          boxShadow: 1, 
          "& .MuiAlert-icon": { fontSize: 32 } 
        }}
        action={
          <IconButton 
            color="inherit" 
            size="small" 
            onClick={onRetry}
            aria-label="Retry loading forecasts"
            sx={{ ml: 1 }}
          >
            <Refresh />
          </IconButton>
        }
      >
        <Typography variant="h6" gutterBottom>
          <ErrorOutline aria-hidden sx={{ verticalAlign: "middle", mr: 1 }} />
          Error Loading Data
        </Typography>
        <Typography variant="body2">
          {message || "An unknown error occurred. Please try again."}
        </Typography>
      </Alert>
    </Container>
  );
}

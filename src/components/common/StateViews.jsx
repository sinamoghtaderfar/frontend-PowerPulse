import { Alert, AlertTitle, Box, Button, Card, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

export function LoadingState({ label = "Loading forecasts" }) {
  return (
    <Box role="status" aria-live="polite" sx={{ py: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <CircularProgress size={18} thickness={5} />
        <Typography variant="body2" color="text.secondary">
          {label}… The first request after a backend restart can take a few seconds.
        </Typography>
      </Stack>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={112} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={360} sx={{ mt: 2 }} />
    </Box>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ bgcolor: "background.paper", alignItems: "flex-start" }}
      action={
        onRetry && (
          <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>Forecasts could not be loaded</AlertTitle>
      {message || "An unknown error occurred. Please try again."}
    </Alert>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Card sx={{ py: 6, px: 3, textAlign: "center" }}>
      <InsightsRoundedIcon aria-hidden sx={{ fontSize: 36, color: "text.disabled" }} />
      <Typography variant="h3" component="p" sx={{ mt: 1.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Card>
  );
}

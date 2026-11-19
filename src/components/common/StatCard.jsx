import { Box, Card, Stack, Typography } from "@mui/material";

/** Compact metric card. `value` is pre-formatted text. */
export default function StatCard({ label, value, unit, caption, accent, icon }) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {accent && (
        <Box aria-hidden sx={{ position: "absolute", inset: "0 auto 0 0", width: 3, bgcolor: accent }} />
      )}
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minHeight: 20 }}>
          {icon}
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </Stack>
        <Typography
          component="p"
          className="tabular-nums"
          sx={{ mt: 1, fontFamily: (t) => t.typography.h1.fontFamily, fontWeight: 600, fontSize: "1.75rem", lineHeight: 1.15 }}
        >
          {value}
          {unit && value !== "—" && (
            <Typography component="span" sx={{ ml: 0.75, fontSize: "0.875rem", fontWeight: 600, color: "text.secondary" }}>
              {unit}
            </Typography>
          )}
        </Typography>
        {caption && (
          <Typography variant="caption" component="p" sx={{ mt: 0.75 }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

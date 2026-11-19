import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      sx={{ mb: { xs: 3, md: 4 }, alignItems: { lg: "flex-end" }, justifyContent: "space-between" }}
    >
      <Box sx={{ maxWidth: 760 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary" component="p">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1">{title}</Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}

import { Box, Card, Stack, Typography } from "@mui/material";

/** Titled card section. */
export default function Section({ title, description, actions, children, id, sx, contentSx }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Card component="section" aria-labelledby={headingId} sx={sx}>
      {(title || actions) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            {title && (
              <Typography variant="h3" component="h2" id={headingId}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
      )}
      <Box sx={{ p: { xs: 2, md: 3 }, ...contentSx }}>{children}</Box>
    </Card>
  );
}

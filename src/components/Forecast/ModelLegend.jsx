import { Box, Typography } from "@mui/material";
import { MODEL_KEYS, getModelColor, getModelDisplayName } from "../../constants/models";

export default function ModelLegend() {
  return (
    <Box
      component="ul"
      aria-label="Model legend"
      sx={{
        display: "flex",
        gap: 3,
        mt: 3,
        pt: 2,
        px: 0,
        mb: 0,
        listStyle: "none",
        borderTop: 1,
        borderColor: "divider",
        flexWrap: "wrap",
      }}
    >
      {MODEL_KEYS.map((model) => (
        <Box component="li" key={model} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            aria-hidden
            sx={{ width: 16, height: 16, borderRadius: "2px", backgroundColor: getModelColor(model) }}
          />
          <Typography variant="body2">{getModelDisplayName(model)}</Typography>
        </Box>
      ))}
      <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          aria-hidden
          sx={{ width: 16, borderTop: `2px dashed ${getModelColor("prophet")}` }}
        />
        <Typography variant="body2">Prophet 95% interval</Typography>
      </Box>
    </Box>
  );
}

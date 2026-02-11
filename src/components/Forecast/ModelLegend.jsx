import { Box, Typography } from "@mui/material";
import { useModelHelpers } from "../../hooks/forecastDataTransformers";

export default function ModelLegend() {
  const { getModelDisplayName, getModelColor, models } = useModelHelpers();

  return (
    <Box sx={{ display: "flex", gap: 3, mt: 3, pt: 2, borderTop: 1, borderColor: "divider", flexWrap: "wrap" }}>
      {models.map((model) => (
        <Box key={model} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "2px",
              backgroundColor: getModelColor(model)
            }}
          />
          <Typography variant="body2">{getModelDisplayName(model)}</Typography>
        </Box>
      ))}
    </Box>
  );
}
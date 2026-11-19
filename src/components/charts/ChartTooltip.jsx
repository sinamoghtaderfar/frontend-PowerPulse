import { Box, Stack, Typography } from "@mui/material";
import ModelDot from "../common/ModelDot";
import { getModelDisplayName } from "../../constants/models";
import { formatInterval, formatValue } from "../../utils/format";
import { palette } from "../../theme/tokens";

/**
 * Tooltip listing each model's forecast and interval for the hovered year.
 * Reads values from the hovered row so bands and lines stay consistent.
 */
export default function ChartTooltip({ active, payload, label, models, unit, getRow }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${palette.border}`,
        borderRadius: 1.5,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        p: 1.5,
        minWidth: 200,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Stack spacing={1}>
        {models.map((model) => {
          const { forecast, lower, upper } = getRow(row, model);
          return (
            <Box key={model}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ModelDot model={model} size={8} />
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {getModelDisplayName(model)}
                </Typography>
                <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 600 }}>
                  {formatValue(forecast)} {unit}
                </Typography>
              </Stack>
              <Typography variant="caption" component="p" className="tabular-nums" sx={{ pl: 2 }}>
                Interval: {formatInterval(lower, upper)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

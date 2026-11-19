import { Chip, Stack } from "@mui/material";
import ModelDot from "../common/ModelDot";
import { getModelDisplayName } from "../../constants/models";

/** Interactive legend: each chip toggles a model's visibility. */
export default function SeriesLegend({ models, visible, onToggle, disabled = [] }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }} role="group" aria-label="Visible models">
      {models.map((model) => {
        const on = visible.includes(model);
        return (
          <Chip
            key={model}
            icon={<ModelDot model={model} />}
            label={getModelDisplayName(model)}
            variant={on ? "filled" : "outlined"}
            onClick={() => onToggle(model)}
            disabled={disabled.includes(model)}
            aria-pressed={on}
            sx={{
              pl: 0.75,
              bgcolor: on ? "background.default" : "transparent",
              borderColor: "divider",
              opacity: on ? 1 : 0.6,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        );
      })}
    </Stack>
  );
}

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import ModelDot from "../common/ModelDot";
import { MODEL_KEYS, getModelDisplayName } from "../../constants/models";

export default function ModelSelector({ value, onChange, unavailable = [] }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      aria-label="Forecast model"
      onChange={(_, next) => next !== null && onChange(next)}
      sx={{ bgcolor: "background.paper", flexWrap: "wrap" }}
    >
      {MODEL_KEYS.map((model) => (
        <ToggleButton key={model} value={model} sx={{ gap: 1, px: 1.75 }} disabled={unavailable.includes(model)}>
          <ModelDot model={model} />
          {getModelDisplayName(model)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

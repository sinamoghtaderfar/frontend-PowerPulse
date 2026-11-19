import { Box } from "@mui/material";
import { getModelColor } from "../../constants/models";

export default function ModelDot({ model, size = 10 }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: getModelColor(model),
        flexShrink: 0,
      }}
    />
  );
}

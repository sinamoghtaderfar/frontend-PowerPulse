import { IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/** Keyboard-accessible info tooltip. */
export default function InfoTip({ title, label = "More information" }) {
  return (
    <Tooltip title={title} enterTouchDelay={0} leaveTouchDelay={6000}>
      <IconButton size="small" aria-label={label} sx={{ color: "text.secondary", p: 0.5 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
}

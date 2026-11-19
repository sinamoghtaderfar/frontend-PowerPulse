import { Link as RouterLink } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import { EmptyState } from "../components/common/StateViews";
import { usePageTitle } from "../hooks/usePageTitle";

/** Custom (uploaded) forecasts are not supported by the API; say so plainly. */
export default function CustomForecast() {
  usePageTitle("Custom forecasts");
  return (
    <>
      <PageHeader eyebrow="Custom forecasts" title="Custom forecasts are not available" />
      <EmptyState
        title="Uploading your own data is not supported yet"
        description="The PowerPulse API only forecasts Germany's electricity generation from its built-in dataset. There is no endpoint for uploaded files, other countries or other models."
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "center" }}>
            <Button variant="contained" component={RouterLink} to="/forecast">
              View model forecasts
            </Button>
            <Button component={RouterLink} to="/methodology">
              Read the methodology
            </Button>
          </Stack>
        }
      />
    </>
  );
}

import { Link as RouterLink } from "react-router-dom";
import { Button } from "@mui/material";
import { EmptyState } from "../components/common/StateViews";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  return (
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Button variant="contained" component={RouterLink} to="/">
          Go to overview
        </Button>
      }
    />
  );
}

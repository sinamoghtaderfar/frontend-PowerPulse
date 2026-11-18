import { Component } from "react";
import { Alert, Button, Container, Typography } from "@mui/material";

/** Catches render errors so a single broken view does not blank the app. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("Unhandled UI error:", error, info.componentStack);
    }
  }

  handleReset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={this.handleReset}>
              Try again
            </Button>
          }
        >
          <Typography variant="h6" component="h1">
            Something went wrong
          </Typography>
          <Typography variant="body2">
            This page could not be displayed. Please try again.
          </Typography>
        </Alert>
      </Container>
    );
  }
}

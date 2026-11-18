import { useId, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { validateCustomForecast } from "../../utils/customForecastValidation";

const countries = ["Germany", "USA", "France", "Canada", "Iran"];
const models = ["Linear Regression", "Random Forest", "XGBoost", "LSTM"];

// The PowerPulse API currently exposes no endpoint for custom (uploaded)
// forecasts, so the form validates input but does not send it anywhere.
const UNSUPPORTED_MESSAGE =
  "Custom forecasts are not available yet: the PowerPulse API currently only provides the built-in Germany forecast.";

const CustomForecastForm = () => {
  const [file, setFile] = useState(null);
  const [country, setCountry] = useState("");
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const countryLabelId = useId();
  const modelLabelId = useId();

  const resetStatus = () => setSubmitted(false);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null);
    setErrors((prev) => ({ ...prev, file: undefined }));
    resetStatus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateCustomForecast({ file, country, model }, { countries, models });
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", mt: 6, p: { xs: 2, sm: 4 }, boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" component="h1" mb={3} align="center">
        Custom Forecast
      </Typography>

      <Button
        variant="outlined"
        component="label"
        fullWidth
        startIcon={<UploadFileIcon />}
        color={errors.file ? "error" : "primary"}
        sx={{ mb: 1 }}
      >
        Upload CSV File
        <input
          type="file"
          hidden
          accept=".csv,text/csv"
          onChange={handleFileChange}
          data-testid="csv-input"
        />
      </Button>

      {file && (
        <Typography variant="body2" mb={1} sx={{ wordBreak: "break-all" }}>
          Selected file: {file.name}
        </Typography>
      )}
      {errors.file && (
        <FormHelperText error sx={{ mb: 1 }}>
          {errors.file}
        </FormHelperText>
      )}

      <FormControl fullWidth sx={{ mt: 2, mb: 3 }} error={Boolean(errors.country)}>
        <InputLabel id={countryLabelId}>Country</InputLabel>
        <Select
          labelId={countryLabelId}
          value={country}
          label="Country"
          onChange={(e) => {
            setCountry(e.target.value);
            setErrors((prev) => ({ ...prev, country: undefined }));
            resetStatus();
          }}
        >
          {countries.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
        {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }} error={Boolean(errors.model)}>
        <InputLabel id={modelLabelId}>Machine Learning Model</InputLabel>
        <Select
          labelId={modelLabelId}
          value={model}
          label="Machine Learning Model"
          onChange={(e) => {
            setModel(e.target.value);
            setErrors((prev) => ({ ...prev, model: undefined }));
            resetStatus();
          }}
        >
          {models.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
        {errors.model && <FormHelperText>{errors.model}</FormHelperText>}
      </FormControl>

      <Button type="submit" variant="contained" fullWidth>
        Generate Forecast
      </Button>

      {submitted && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {UNSUPPORTED_MESSAGE}
        </Alert>
      )}
    </Box>
  );
};

export default CustomForecastForm;

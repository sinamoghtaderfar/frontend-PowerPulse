import React, { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const countries = ["Germany", "USA", "France", "Canada", "Iran"];
const models = ["Linear Regression", "Random Forest", "XGBoost", "LSTM"];

const CustomForecastForm = () => {
  const [file, setFile] = useState(null);
  const [country, setCountry] = useState("");
  const [model, setModel] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !country || !model) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("country", country);
    formData.append("model", model);

    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      console.log("Backend response:", data);
      alert("File successfully uploaded.");
    } catch (error) {
      console.error(error);
      alert("Error while sending data to the backend.");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 6,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" mb={3} align="center">
        Custom Forecast
      </Typography>

      {/* CSV Upload */}
      <Button
        variant="outlined"
        component="label"
        fullWidth
        startIcon={<UploadFileIcon />}
        sx={{ mb: 2 }}
      >
        Upload CSV File
        <input type="file" hidden accept=".csv" onChange={handleFileChange} />
      </Button>

      {file && (
        <Typography variant="body2" mb={2}>
          Selected file: {file.name}
        </Typography>
      )}

      {/* Country Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Country</InputLabel>
        <Select
          value={country}
          label="Country"
          onChange={(e) => setCountry(e.target.value)}
        >
          {countries.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ML Model Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Machine Learning Model</InputLabel>
        <Select
          value={model}
          label="Machine Learning Model"
          onChange={(e) => setModel(e.target.value)}
        >
          {models.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Generate Forecast
      </Button>
    </Box>
  );
};

export default CustomForecastForm;

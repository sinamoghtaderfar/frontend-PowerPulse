import React from "react";
import CustomForecastForm from "../components/customforecast/CustomForecastForm";
import { Box } from "@mui/material";

const CustomForecast = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)", 
        py: 6, 
      }}
    >
      <CustomForecastForm />
    </Box>
  );
};

export default CustomForecast;

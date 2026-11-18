export const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024;

const CSV_MIME_TYPES = new Set(["text/csv", "application/vnd.ms-excel", ""]);

/** Validate the custom-forecast form; returns a map of field -> error message. */
export function validateCustomForecast({ file, country, model }, { countries, models }) {
  const errors = {};
  if (!file) {
    errors.file = "Please select a CSV file.";
  } else if (!file.name?.toLowerCase().endsWith(".csv") || !CSV_MIME_TYPES.has(file.type ?? "")) {
    errors.file = "Only .csv files are supported.";
  } else if (file.size === 0) {
    errors.file = "The selected file is empty.";
  } else if (file.size > MAX_CSV_SIZE_BYTES) {
    errors.file = "The file must be 5 MB or smaller.";
  }
  if (!countries.includes(country)) errors.country = "Please select a country.";
  if (!models.includes(model)) errors.model = "Please select a model.";
  return errors;
}

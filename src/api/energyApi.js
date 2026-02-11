const API_BASE = ""; 

export async function getAllForecasts(yearsAhead = 10) {
  const res = await fetch(`${API_BASE}/forecast/all?years_ahead=${yearsAhead}`);

  if (!res.ok) {
    throw new Error("Failed to fetch forecasts");
  }
  return await res.json();
}


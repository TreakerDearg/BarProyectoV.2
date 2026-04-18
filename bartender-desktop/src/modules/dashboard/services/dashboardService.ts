// services/dashboardService.ts
import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

export async function fetchDashboard() {
  const { data } = await axios.get(API);
  return data;
}
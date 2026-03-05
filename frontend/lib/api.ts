import axios from "axios";
import { getCms } from "./cms";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const cms = getCms();
  const params = { ...(config.params || {}) };
  if (!params.cms) {
    params.cms = cms;
  }
  config.params = params;
  return config;
});

export default api;

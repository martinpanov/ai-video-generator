import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { API_URL } from "../constants";

type Params<T extends Record<string, unknown>> = {
  endpoint: string;
  method: "GET" | "PUT" | "POST" | "DELETE";
  body?: T;
  responseType?: "json" | "text";
};

export async function apiFetch<T extends Record<string, unknown>>({
  endpoint,
  method = "GET",
  body,
  responseType = "json"
}: Params<T>) {
  const requestData: RequestInit = {
    method: method,
    headers: {
      "x-api-key": process.env.API_KEY || '',
      "Content-Type": "application/json"
    },
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(endpoint?.includes("http") ? endpoint : `${API_URL}${endpoint}`, requestData);

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (responseType === "text") {
    return await response.text();
  }

  return await response.json();
}

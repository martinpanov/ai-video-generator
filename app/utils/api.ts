import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { PROD_URL } from "../constants";

type Params = {
  endpoint: string;
  method: "GET" | "PUT" | "POST" | "DELETE";
  body?: any;
  responseType?: "json" | "text";
};

export async function apiFetch({
  endpoint,
  method = "GET",
  body,
  responseType = "json"
}: Params) {
  let requestData: RequestInit = {
    method: method,
    headers: {
      "x-api-key": process.env.API_KEY || '',
      "Content-Type": "application/json"
    }
  };

  if (body) {
    requestData.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint?.includes("http") ? endpoint : `${PROD_URL}${endpoint}`, requestData);

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (responseType === "text") {
    return await response.text();
  }

  return await response.json();
}

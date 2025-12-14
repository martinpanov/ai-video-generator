import { API_ENV, PROD_URL } from "../constants";

/**
 * Converts MinIO internal URLs to publicly accessible URLs
 * @param url - The MinIO internal URL
 * @param forBackend - If true, returns URL accessible from Docker containers (minio:9000)
 *                     If false, returns URL accessible from browser (127.0.0.1:9000 or production URL)
 */
export const toPublicUrl = (url: string | null, forBackend = false): string => {
  if (!url) return '';

  if (API_ENV === "production") {
    return url.replace('http://minio:9000', `${PROD_URL}/minio`);
  }

  // In dev:local
  if (forBackend) {
    // For backend/Docker containers: convert localhost/127.0.0.1 back to minio:9000
    return url
      .replace('http://localhost:9000', 'http://minio:9000')
      .replace('http://127.0.0.1:9000', 'http://minio:9000');
  }

  // For frontend/browser: convert minio:9000 to 127.0.0.1:9000 (bypasses Next.js private IP check)
  return url.replace('http://minio:9000', 'http://127.0.0.1:9000');
};
import { PROD_URL } from "../constants";

export const toPublicUrl = (url: string) =>
  url?.replace('http://minio:9000', `${PROD_URL}/minio`);
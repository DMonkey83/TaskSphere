// lib/httpsAgent.ts
import fs from "fs";
import https from "https";
import path from "path";

const certPath = path.resolve(process.cwd(), "../../certs");

export const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(certPath, "rootCA.pem")), // mkcert CA
});

import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();

const certPath = path.resolve(process.cwd(), '../../certs');

const httpsOptions = {
  key: fs.readFileSync(path.join(certPath, 'cert.key')),
  cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
};

async function main() {
  await app.prepare();

  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url || '', true);
    handle(req, res, parsedUrl);
  }).listen(3001, () => {
    console.log('> HTTPS Next.js server running on https://localhost:3001');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

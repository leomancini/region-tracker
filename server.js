import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3122;
const DATA_DIR = path.join(__dirname, 'data');

await mkdir(DATA_DIR, { recursive: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function sanitizeUsername(name) {
  if (!name || !/^[a-zA-Z0-9_-]{1,50}$/.test(name)) return null;
  return name.toLowerCase();
}

function validateRegionData(data) {
  if (!data || typeof data !== 'object') return false;
  const keys = ['countries', 'states', 'provinces'];
  for (const key of keys) {
    if (!Array.isArray(data[key])) return false;
    if (!data[key].every(item => typeof item === 'string' && item.length < 100)) return false;
  }
  if (Object.keys(data).length !== 3) return false;
  return true;
}

app.get('/api/:user/regions', async (req, res) => {
  const username = sanitizeUsername(req.params.user);
  if (!username) return res.status(400).json({ error: 'Invalid username' });

  const filePath = path.join(DATA_DIR, `${username}.json`);
  try {
    const raw = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json({ countries: [], states: [], provinces: [] });
    } else {
      res.status(500).json({ error: 'Failed to read data' });
    }
  }
});

app.post('/api/:user/regions', async (req, res) => {
  const username = sanitizeUsername(req.params.user);
  if (!username) return res.status(400).json({ error: 'Invalid username' });

  if (!validateRegionData(req.body)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const filePath = path.join(DATA_DIR, `${username}.json`);
  try {
    await writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/user/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

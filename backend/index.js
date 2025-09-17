// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// cache y rate limit
const cache = new NodeCache({ stdTTL: 30 });
const limiter = rateLimit({ windowMs: 60 * 1000, max: 40, message: { error: 'Too many requests' }});
app.use('/api/', limiter);

// data persistence simple (file-based)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const ARTICLES_META_FILE = path.join(DATA_DIR, 'articles.json');

function loadJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return fallback; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let comments = loadJSON(COMMENTS_FILE, []);
let articleMeta = loadJSON(ARTICLES_META_FILE, {});

// helper: id desde url
function articleIdFromUrl(url) {
  return crypto.createHash('md5').update(url || '').digest('hex');
}

/**
 * GET /api/news
 * Query params: q, category, sources, page, pageSize, country, sortBy
 */
app.get('/api/news', async (req, res) => {
  try {
    const { q, category, sources, page = 1, pageSize = 20, country, sortBy } = req.query;
    const cacheKey = `news:${JSON.stringify(req.query)}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    if (!NEWSAPI_KEY) return res.status(500).json({ error: 'NEWSAPI_KEY not configured' });

    const params = { apiKey: NEWSAPI_KEY, page, pageSize };
    if (q) params.q = q;
    if (sources) params.sources = sources;
    if (category) params.category = category;
    if (country) params.country = country;
    if (sortBy) params.sortBy = sortBy;

    const endpoint = q ? 'https://newsapi.org/v2/everything' : 'https://newsapi.org/v2/top-headlines';
    const response = await axios.get(endpoint, { params });
    const articles = (response.data.articles || []).map(a => {
      const id = articleIdFromUrl(a.url || a.title || JSON.stringify(a));
      const meta = articleMeta[id] || { read: false, relevant: false };
      return { id, ...a, meta };
    });

    const out = { ...response.data, articles };
    cache.set(cacheKey, out);
    res.json(out);
  } catch (err) {
    console.error('news error', err.message || err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/**
 * Comments: GET and POST
 */
app.get('/api/comments', (req, res) => {
  const { articleId } = req.query;
  if (articleId) return res.json(comments.filter(c => c.articleId === articleId));
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { articleId, author, text } = req.body;
  if (!articleId || !text) return res.status(400).json({ error: 'articleId and text required' });
  const comment = { id: Date.now().toString(), articleId, author: author || 'Anon', text, createdAt: new Date().toISOString() };
  comments.push(comment);
  saveJSON(COMMENTS_FILE, comments);
  io.emit('comment', comment); // notify clients
  res.status(201).json(comment);
});

/**
 * Mark article read/relevant
 */
app.post('/api/articles/:id/mark', (req, res) => {
  const id = req.params.id;
  const { read, relevant } = req.body;
  const meta = articleMeta[id] || { read: false, relevant: false };
  if (typeof read === 'boolean') meta.read = read;
  if (typeof relevant === 'boolean') meta.relevant = relevant;
  articleMeta[id] = meta;
  saveJSON(ARTICLES_META_FILE, articleMeta);
  io.emit('article:update', { id, meta });
  res.json({ id, meta });
});

/**
 * Socket.io connection: emits 'comment' and 'article:update'
 */
io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

server.listen(PORT, () => console.log(`Newsroom backend running on http://localhost:${PORT}`));
import jsonServer from 'json-server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Убедимся, что папка uploads существует
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Настройка хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware для добавления задержки (опционально)
// server.use((req, res, next) => {
//   setTimeout(next, 0);
// });

// Кастомный маршрут для загрузки файлов (API)
// Handle both /api/upload and /upload for compatibility
const handleUpload = (req, res) => {
  if (req.file) {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
};

server.post('/api/upload', upload.single('image'), handleUpload);
server.post('/upload', upload.single('image'), handleUpload);

// Раздача статики (загруженных картинок)
// Serve uploads at /api/uploads and /uploads
server.use('/uploads', express.static(uploadDir));
server.use('/api/uploads', express.static(uploadDir));

// Mount JSON Server router at /api and root (for backward compatibility if needed, but better to enforce /api)
// We mount at /api so built frontend works (requests /api/properties)
server.use('/api', router);
// Also mount at root IF request is not for static files? 
// But we want to serve frontend at root.
// If we mount router at root, it might conflict with frontend routes if they share names (e.g. /clients vs /clients in DB).
// DB has 'properties', 'clients', 'customOptions'.
// Frontend has '/', '/clients', '/login', '/property/:id'.
// '/clients' collides!
// So we CANNOT mount router at root if we want to serve frontend.
// The frontend MUST use /api prefix.
// Luckily, we configured API_BASE_URL to /api.

// Serve Static Frontend (Dist)
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  server.use(express.static(distDir));
  
  // SPA Fallback
  server.get('*', (req, res, next) => {
    // If request is for API (starting with /api) and not handled, return 404
    if (req.path.startsWith('/api')) {
      return next(); // Let default json-server 404 handler handle it (or just return 404)
    }
    // Otherwise serve index.html
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn('Dist folder not found. Frontend will not be served.');
}

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Custom JSON Server is running on port ${PORT}`);
});

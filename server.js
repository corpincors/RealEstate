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

// Middleware для добавления задержки (опционально, если нужно эмулировать сеть, но мы наоборот хотим быстрее)
// server.use((req, res, next) => {
//   setTimeout(next, 0);
// });

// Кастомный маршрут для загрузки файлов
server.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    // Возвращаем URL загруженного файла
    // Используем относительный путь или полный URL в зависимости от потребностей
    // В данном случае, так как фронтенд и бэкенд могут быть на разных портах, лучше возвращать полный URL,
    // но если мы проксируем, то можно и относительный.
    // Для простоты вернем полный URL, предполагая, что клиент обращается к этому же хосту/порту.
    
    // Важно: req.protocol может врать за прокси (ngrok/serveo), поэтому лучше использовать относительный путь
    // или настроить trust proxy.
    // Но так как картинки сохраняются как строки в БД, лучше сохранять путь вида '/uploads/filename.jpg'
    // и на клиенте подставлять API_BASE_URL.
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Раздача статики (загруженных картинок)
server.use('/uploads', express.static(uploadDir));

server.use(router);

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Custom JSON Server is running on port ${PORT}`);
});

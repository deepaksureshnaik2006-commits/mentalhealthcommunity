import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../auth.js';

const router = Router();

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

ensureDir(path.join(UPLOAD_ROOT, 'avatars'));
ensureDir(path.join(UPLOAD_ROOT, 'messages'));

const storage = multer.diskStorage({
  destination(req: Request, _file, cb) {
    const userId = req.auth!.userId;
    const kind = (req.params.kind as string) === 'avatars' ? 'avatars' : 'messages';
    const dir = path.join(UPLOAD_ROOT, kind, userId);
    ensureDir(dir);
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 10);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post(
  '/:kind',
  requireAuth,
  upload.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const kind = req.params.kind === 'avatars' ? 'avatars' : 'messages';
    const userId = req.auth!.userId;
    const url = `/uploads/${kind}/${userId}/${req.file.filename}`;
    res.json({ url });
  }
);

export default router;

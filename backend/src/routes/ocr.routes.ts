import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { OCRController } from '../controllers/ocr.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const ocrController = new OCRController();

// Prepare uploads directory
const uploadDir = path.join(process.cwd(), 'uploads', 'ocr');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Only images (JPEG/JPG/PNG) and PDFs are allowed.'));
  },
});

// Protect all OCR routes
router.use(authenticateJWT);

router.get('/', ocrController.getAllDocuments);
router.get('/:id', ocrController.getDocumentById);
router.post('/upload', upload.single('file'), ocrController.uploadDocument);
router.post('/:id/review', ocrController.reviewDocument);

export default router;

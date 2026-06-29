"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ocr_controller_1 = require("../controllers/ocr.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ocrController = new ocr_controller_1.OCRController();
// Prepare uploads directory
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'ocr');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Only images (JPEG/JPG/PNG) and PDFs are allowed.'));
    },
});
// Protect all OCR routes
router.use(auth_middleware_1.authenticateJWT);
router.get('/', ocrController.getAllDocuments);
router.get('/:id', ocrController.getDocumentById);
router.post('/upload', upload.single('file'), ocrController.uploadDocument);
router.post('/:id/review', ocrController.reviewDocument);
exports.default = router;

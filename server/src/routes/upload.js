import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, isArtist } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// ===========================================
// STORAGE CONFIGURATION
// ===========================================

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const audioDir = path.join(uploadDir, 'audio');
const imagesDir = path.join(uploadDir, 'images');

[uploadDir, audioDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio/');
    cb(null, isAudio ? audioDir : imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Audio files
  const allowedAudioTypes = [
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/x-flac',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
  ];

  // Image files
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  const isAudio = allowedAudioTypes.includes(file.mimetype);
  const isImage = allowedImageTypes.includes(file.mimetype);

  if (isAudio || isImage) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

// Multer instances
const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
});

const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
});

// ===========================================
// ROUTES
// ===========================================

// Upload audio track
router.post('/audio', authenticate, isArtist, uploadAudio.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No audio file provided',
    });
  }

  const { releaseId, trackNumber } = req.body;

  // Generate file key/path
  const fileKey = `audio/${req.file.filename}`;
  const fileUrl = `${process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`}/uploads/${fileKey}`;

  // If releaseId and trackNumber provided, update the track
  if (releaseId && trackNumber) {
    const release = await prisma.release.findFirst({
      where: {
        id: releaseId,
        userId: req.user.id,
      },
    });

    if (release) {
      await prisma.track.updateMany({
        where: {
          releaseId,
          trackNumber: parseInt(trackNumber),
        },
        data: {
          audioKey: fileKey,
          audioUrl: fileUrl,
          audioFormat: path.extname(req.file.originalname).slice(1).toUpperCase(),
          status: 'READY',
        },
      });
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'AUDIO_UPLOADED',
      entityType: 'Track',
      newValues: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Audio file uploaded successfully',
    file: {
      key: fileKey,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
}));

// Upload multiple audio tracks
router.post('/audio/batch', authenticate, isArtist, uploadAudio.array('files', 30), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No audio files provided',
    });
  }

  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`;

  const files = req.files.map(file => ({
    key: `audio/${file.filename}`,
    url: `${baseUrl}/uploads/audio/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.status(201).json({
    success: true,
    message: `${files.length} audio files uploaded successfully`,
    files,
  });
}));

// Upload cover art
router.post('/cover', authenticate, isArtist, uploadImage.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No image file provided',
    });
  }

  const { releaseId } = req.body;

  const fileKey = `images/${req.file.filename}`;
  const fileUrl = `${process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`}/uploads/${fileKey}`;

  // If releaseId provided, update the release
  if (releaseId) {
    const release = await prisma.release.findFirst({
      where: {
        id: releaseId,
        userId: req.user.id,
      },
    });

    if (release) {
      await prisma.release.update({
        where: { id: releaseId },
        data: {
          coverArtKey: fileKey,
          coverArtUrl: fileUrl,
        },
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Cover art uploaded successfully',
    file: {
      key: fileKey,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
}));

// Upload avatar
router.post('/avatar', authenticate, uploadImage.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No image file provided',
    });
  }

  const fileKey = `images/${req.file.filename}`;
  const fileUrl = `${process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`}/uploads/${fileKey}`;

  // Update user avatar
  await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl: fileUrl },
  });

  res.status(201).json({
    success: true,
    message: 'Avatar uploaded successfully',
    file: {
      key: fileKey,
      url: fileUrl,
    },
  });
}));

// Delete file
router.delete('/:type/:filename', authenticate, asyncHandler(async (req, res) => {
  const { type, filename } = req.params;

  if (!['audio', 'images'].includes(type)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid file type',
    });
  }

  const filePath = path.join(uploadDir, type, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'File not found',
    });
  }

  // Delete file
  fs.unlinkSync(filePath);

  res.json({
    success: true,
    message: 'File deleted successfully',
  });
}));

// Get upload signed URL (for S3-like services - placeholder)
router.post('/presigned', authenticate, isArtist, asyncHandler(async (req, res) => {
  const { filename, contentType, fileSize } = req.body;

  // In production, generate S3 presigned URL here
  // For now, return local upload endpoint
  const key = `${uuidv4()}${path.extname(filename)}`;
  const isAudio = contentType.startsWith('audio/');

  res.json({
    success: true,
    uploadUrl: `${process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`}/api/upload/${isAudio ? 'audio' : 'cover'}`,
    key: `${isAudio ? 'audio' : 'images'}/${key}`,
    method: 'POST',
    fields: {
      'Content-Type': contentType,
    },
  });
}));

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File size exceeds the maximum allowed limit',
      });
    }
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
  }

  next(err);
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Generate tokens
const generateTokens = (userId, rememberMe = false) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// ===========================================
// REGISTER
// ===========================================
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name, accountType } = req.body;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'An account with this email already exists',
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Create user with transaction
  const user = await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: accountType,
        status: 'ACTIVE', // In production, set to PENDING and verify email
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      },
    });

    // Create subscription (Free tier)
    await tx.subscription.create({
      data: {
        userId: newUser.id,
        plan: 'FREE',
        commissionRate: 15,
        maxArtistProfiles: 1,
      },
    });

    // Create wallet
    await tx.wallet.create({
      data: {
        userId: newUser.id,
      },
    });

    // Create default artist profile for artists
    if (accountType === 'ARTIST') {
      await tx.artistProfile.create({
        data: {
          userId: newUser.id,
          name: name,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
        },
      });
    }

    return newUser;
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: jwt.sign({ t: Date.now() }, process.env.JWT_SECRET),
      refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Return user data (without sensitive info)
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  });
}));

// ===========================================
// LOGIN
// ===========================================
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      subscription: {
        select: {
          plan: true,
          commissionRate: true,
          isActive: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  // Check user status
  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your account has been suspended. Please contact support.',
    });
  }

  if (user.status === 'DELETED') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'This account has been deleted.',
    });
  }

  if (user.status === 'PENDING') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Please verify your email address to continue.',
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, rememberMe);

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: jwt.sign({ t: Date.now() }, process.env.JWT_SECRET),
      refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: req.ip,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      subscription: user.subscription,
    },
    accessToken,
    refreshToken,
  });
}));

// ===========================================
// LOGOUT
// ===========================================
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // Delete session
  await prisma.session.delete({
    where: { id: req.sessionId },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: req.user.id,
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

// ===========================================
// GET CURRENT USER
// ===========================================
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatarUrl: true,
      phone: true,
      countryCode: true,
      timezone: true,
      emailVerified: true,
      createdAt: true,
      subscription: {
        select: {
          plan: true,
          commissionRate: true,
          maxArtistProfiles: true,
          isActive: true,
          expiresAt: true,
        },
      },
      artistProfiles: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
      wallet: {
        select: {
          availableBalance: true,
          pendingBalance: true,
          lifetimeEarnings: true,
        },
      },
    },
  });

  res.json({ user });
}));

// ===========================================
// UPDATE PROFILE
// ===========================================
router.patch('/profile', authenticate, validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const { name, phone, countryCode, timezone } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(countryCode !== undefined && { countryCode }),
      ...(timezone && { timezone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      phone: true,
      countryCode: true,
      timezone: true,
    },
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
  });
}));

// ===========================================
// CHANGE PASSWORD
// ===========================================
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { passwordHash: true },
  });

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  });

  // Invalidate all other sessions
  await prisma.session.deleteMany({
    where: {
      userId: req.user.id,
      id: { not: req.sessionId },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: req.user.id,
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

// ===========================================
// REFRESH TOKEN
// ===========================================
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Find session with this refresh token
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update session
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        lastActivityAt: new Date(),
      },
    });

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired refresh token',
    });
  }
}));

export default router;

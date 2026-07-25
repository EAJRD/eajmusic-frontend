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

// ===========================================
// FORGOT PASSWORD
// ===========================================
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Bad Request', message: 'Email is required' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Prefer the Origin the request actually came from so the link lands the
  // user back on whichever subdomain (main/artist/admin) they requested from,
  // instead of always sending them to FRONTEND_URL's single configured domain.
  const resetBaseUrl = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${resetBaseUrl}/reset-password?token=${resetToken}`;

  // Dev-only fallback so the flow is testable without SMTP configured.
  // Never log a live reset token in production - it's a bearer credential.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[PASSWORD RESET] Token for ${email}: ${resetUrl}\n`);
  }

  // TODO: Send email via SMTP when configured
  // Use nodemailer with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"EAJMUSIC" <noreply@eajmusic.com>',
        to: email,
        subject: 'Reset Your Password - EAJMUSIC',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new one:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">EAJMUSIC - Music Distribution Platform</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('[EMAIL ERROR]', emailError.message);
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
    },
  });

  res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
}));

// ===========================================
// RESET PASSWORD
// ===========================================
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Bad Request', message: 'Token and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Bad Request', message: 'Password must be at least 8 characters' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId: decoded.userId },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'User',
        entityId: decoded.userId,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid or expired reset token' });
  }
}));

export default router;

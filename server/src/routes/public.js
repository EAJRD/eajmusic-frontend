import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/newsletter', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { status: 'SUBSCRIBED' },
    create: { email },
  });

  res.status(201).json({ success: true, subscriber });
}));

router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  res.status(201).json({ success: true, contactMessage });
}));

export default router;

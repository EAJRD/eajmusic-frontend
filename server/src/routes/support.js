import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/tickets', asyncHandler(async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: req.user.id },
    include: { messages: true },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ tickets });
}));

router.post('/tickets', asyncHandler(async (req, res) => {
  const { subject, category, priority, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: req.user.id,
      subject,
      category: category || 'General',
      priority: priority || 'normal',
      messages: {
        create: {
          userId: req.user.id,
          message,
        },
      },
    },
    include: { messages: true },
  });

  res.status(201).json({ success: true, ticket });
}));

router.post('/tickets/:id/messages', asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const newMessage = await prisma.supportTicketMessage.create({
    data: {
      ticketId: ticket.id,
      userId: req.user.id,
      message,
    },
  });

  // Re-open ticket if it was closed
  if (ticket.status !== 'OPEN') {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'OPEN' },
    });
  }

  res.status(201).json({ success: true, message: newMessage });
}));

export default router;

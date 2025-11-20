import { Router } from 'express';
import {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.put('/conversations/:id/read', markAsRead);
router.get('/unread/count', getUnreadCount);

export default router;
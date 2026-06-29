import { Router } from 'express';
import { PaymentReminderController } from '../controllers/reminder.controller';
import { validate } from '../middleware/validate.middleware';
import { createReminderSchema } from '../validators/reminder.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const reminderController = new PaymentReminderController();

// Protect all reminder routes
router.use(authenticateJWT);

router.get('/', reminderController.getAllReminders);
router.post('/', validate(createReminderSchema), reminderController.createReminder);
router.post('/:id/trigger', reminderController.triggerReminderManual);
router.get('/logs', reminderController.getReminderLogs);

export default router;

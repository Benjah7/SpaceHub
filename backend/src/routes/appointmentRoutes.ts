import { Router } from 'express';
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    rescheduleAppointment,
    deleteAppointment,
    getUpcomingCount
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/upcoming/count', getUpcomingCount);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);
router.delete('/:id', deleteAppointment);

export default router;
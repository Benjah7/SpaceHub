'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppointments } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { APPOINTMENT_STATUS_LABELS, type AppointmentStatus, type Appointment } from '@/types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const ROLE_OPTIONS = [
    { value: '', label: 'All Appointments' },
    { value: 'tenant', label: 'As Tenant' },
    { value: 'owner', label: 'As Owner' },
];

export default function AppointmentsPage() {
    const { user } = useAuthStore();
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const { appointments, loading, refetch } = useAppointments({
        status: statusFilter as AppointmentStatus | undefined,
        role: roleFilter as 'tenant' | 'owner' | undefined,
    });

    const handleConfirm = async (appointment: Appointment) => {
        try {
            await apiClient.updateAppointmentStatus(appointment.id, 'CONFIRMED');
            toast.success('Appointment confirmed');
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to confirm appointment');
        }
    };

    const handleComplete = async (appointment: Appointment) => {
        try {
            await apiClient.updateAppointmentStatus(appointment.id, 'COMPLETED');
            toast.success('Appointment marked as completed');
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to complete appointment');
        }
    };

    const handleCancelClick = (appointment: Appointment) => {
        setAppointmentToCancel(appointment);
        setShowCancelDialog(true);
    };

    const handleCancelConfirm = async () => {
        if (!appointmentToCancel) return;

        try {
            setCancelling(true);
            await apiClient.updateAppointmentStatus(
                appointmentToCancel.id,
                'CANCELLED',
                'Cancelled by user'
            );
            toast.success('Appointment cancelled');
            setShowCancelDialog(false);
            setAppointmentToCancel(null);
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to cancel appointment');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="warning">Pending</Badge>;
            case 'CONFIRMED':
                return <Badge variant="info">Confirmed</Badge>;
            case 'COMPLETED':
                return <Badge variant="success">Completed</Badge>;
            case 'CANCELLED':
                return <Badge variant="error">Cancelled</Badge>;
        }
    };

    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case 'PENDING':
                return <AlertCircle className="w-5 h-5 text-status-warning" />;
            case 'CONFIRMED':
                return <CheckCircle className="w-5 h-5 text-status-info" />;
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-status-success" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-status-error" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-bg py-xl">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-xl"
                >
                    <h1 className="text-h1 mb-2">Appointments</h1>
                    <p className="text-body text-neutral-text-secondary">
                        Manage your property viewing appointments
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-md mb-lg">
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={STATUS_OPTIONS}
                        className="sm:w-48"
                    />
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        options={ROLE_OPTIONS}
                        className="sm:w-48"
                    />
                </div>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No appointments found"
                        description={
                            statusFilter || roleFilter
                                ? 'Try adjusting your filters'
                                : 'Schedule property viewings to get started'
                        }
                    />
                ) : (
                    <div className="space-y-md">
                        {appointments.map((appointment) => {
                            const isOwner = appointment.ownerId === user?.id;
                            const otherParty = isOwner ? appointment.tenant : appointment.owner;
                            const canConfirm = isOwner && appointment.status === 'PENDING';
                            const canComplete = isOwner && appointment.status === 'CONFIRMED';
                            const canCancel = appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED';

                            return (
                                <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card>
                                        <div className="p-lg">
                                            <div className="flex items-start justify-between mb-md">
                                                <div className="flex items-center gap-sm">
                                                    {getStatusIcon(appointment.status)}
                                                    <div>
                                                        <h3 className="text-h4">{appointment.property?.propertyName}</h3>
                                                        <p className="text-small text-neutral-text-secondary flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {appointment.property?.address}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(appointment.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                                                <div className="flex items-center gap-sm text-small">
                                                    <Calendar className="w-4 h-4 text-neutral-text-tertiary" />
                                                    <span>{formatDate(appointment.scheduledDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-sm text-small">
                                                    <Clock className="w-4 h-4 text-neutral-text-tertiary" />
                                                    <span>{formatTime(appointment.scheduledDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-sm text-small">
                                                    <User className="w-4 h-4 text-neutral-text-tertiary" />
                                                    <span>
                                                        {isOwner ? 'Tenant' : 'Owner'}: {otherParty?.name}
                                                    </span>
                                                </div>
                                                {appointment.property?.monthlyRent && (
                                                    <div className="flex items-center gap-sm text-small">
                                                        <span className="font-semibold">
                                                            {formatCurrency(appointment.property.monthlyRent)}/month
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {appointment.notes && (
                                                <div className="mb-md p-sm bg-neutral-bg-secondary rounded-lg">
                                                    <p className="text-small text-neutral-text-secondary">
                                                        <span className="font-semibold">Notes:</span> {appointment.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {appointment.cancellationReason && (
                                                <div className="mb-md p-sm bg-status-error/10 rounded-lg">
                                                    <p className="text-small text-status-error">
                                                        <span className="font-semibold">Cancellation reason:</span>{' '}
                                                        {appointment.cancellationReason}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-sm">
                                                {canConfirm && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleConfirm(appointment)}
                                                        leftIcon={<CheckCircle className="w-4 h-4" />}
                                                    >
                                                        Confirm
                                                    </Button>
                                                )}
                                                {canComplete && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleComplete(appointment)}
                                                        leftIcon={<CheckCircle className="w-4 h-4" />}
                                                    >
                                                        Mark Completed
                                                    </Button>
                                                )}
                                                {canCancel && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleCancelClick(appointment)}
                                                        leftIcon={<XCircle className="w-4 h-4" />}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    href={`/properties/${appointment.propertyId}`}
                                                >
                                                    View Property
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Cancel Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showCancelDialog}
                    onClose={() => setShowCancelDialog(false)}
                    onConfirm={handleCancelConfirm}
                    title="Cancel Appointment"
                    description="Are you sure you want to cancel this appointment? This action cannot be undone."
                    confirmLabel="Cancel Appointment"
                    cancelLabel="Keep Appointment"
                    loading={cancelling}
                    variant="danger"
                />
            </div>
        </div>
    );
}
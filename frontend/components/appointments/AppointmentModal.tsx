'use client';

import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import type { Property } from '@/types';
import toast from 'react-hot-toast';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
    onSuccess?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    property,
    onSuccess,
}) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !time) {
            toast.error('Please select date and time');
            return;
        }

        try {
            setLoading(true);
            const scheduledDate = `${date}T${time}:00`;

            await apiClient.createAppointment({
                propertyId: property.id,
                scheduledDate,
                notes,
            });

            toast.success('Viewing request sent! Owner will confirm shortly.');
            onClose();
            onSuccess?.();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to schedule viewing');
        } finally {
            setLoading(false);
        }
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Property Viewing">
            <form onSubmit={handleSubmit} className="space-y-md">
                <div>
                    <h4 className="text-h4 mb-2">{property.title}</h4>
                    <p className="text-small text-neutral-text-secondary">{property.location.address}</p>
                </div>

                <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    required
                    leftIcon={<Calendar className="w-4 h-4" />}
                />

                <Input
                    label="Time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    leftIcon={<Clock className="w-4 h-4" />}
                />

                <div>
                    <label className="block text-small font-medium text-neutral-text-primary mb-1">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific requirements or questions..."
                        className="w-full px-md py-sm border border-neutral-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        rows={3}
                    />
                </div>

                <div className="flex gap-md pt-md">
                    <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" isLoading={loading} fullWidth>
                        Request Viewing
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
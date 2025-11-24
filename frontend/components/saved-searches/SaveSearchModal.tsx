// frontend/components/saved-searches/SaveSearchModal.tsx - CORRECTED
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PROPERTY_TYPE_LABELS, PropertyType } from '@/types';
import type { SavedSearch, SearchCriteria } from '@/types';

interface SaveSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, criteria: SearchCriteria) => Promise<void>;
    initialData?: SavedSearch;
    currentCriteria?: SearchCriteria;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    currentCriteria,
}) => {
    const [name, setName] = useState('');
    const [criteria, setCriteria] = useState<SearchCriteria>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCriteria(initialData.criteria);
        } else if (currentCriteria) {
            setCriteria(currentCriteria);
        }
    }, [initialData, currentCriteria]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSaving(true);
        try {
            await onSave(name, criteria);
            onClose();
            setName('');
            setCriteria({});
        } finally {
            setSaving(false);
        }
    };

    const propertyTypeOptions = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Saved Search' : 'Save Search'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Search Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Westlands Retail Shops"
                    required
                />

                <Input
                    label="Neighborhood"
                    value={criteria.neighborhood || ''}
                    onChange={(e) => setCriteria({ ...criteria, neighborhood: e.target.value })}
                    placeholder="e.g., Westlands"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Min Price (KES)"
                        type="number"
                        value={criteria.minRent || ''}
                        onChange={(e) => setCriteria({ ...criteria, minRent: parseFloat(e.target.value) || undefined })}
                        placeholder="20000"
                    />
                    <Input
                        label="Max Price (KES)"
                        type="number"
                        value={criteria.maxRent || ''}
                        onChange={(e) => setCriteria({ ...criteria, maxRent: parseFloat(e.target.value) || undefined })}
                        placeholder="100000"
                    />
                </div>

                <Select
                    label="Property Type"
                    value={criteria.propertyType || ''}
                    onChange={(e) => setCriteria({ ...criteria, propertyType: e.target.value as any || undefined })}
                    options={[{ value: '', label: 'All Types' }, ...propertyTypeOptions]}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Min Size (sq m)"
                        type="number"
                        value={criteria.minSquareFeet || ''}
                        onChange={(e) => setCriteria({ ...criteria, minSquareFeet: parseFloat(e.target.value) || undefined })}
                        placeholder="50"
                    />
                    <Input
                        label="Max Size (sq m)"
                        type="number"
                        value={criteria.maxSquareFeet || ''}
                        onChange={(e) => setCriteria({ ...criteria, maxSquareFeet: parseFloat(e.target.value) || undefined })}
                        placeholder="500"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={saving}
                    >
                        {initialData ? 'Update' : 'Save'} Search
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
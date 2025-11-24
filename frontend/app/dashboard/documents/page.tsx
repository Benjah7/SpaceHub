'use client';

import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { useDocuments } from '@/lib/hooks/useDocuments';

const DOCUMENT_TYPE_FILTERS = [
    { value: '', label: 'All Documents' },
    { value: 'LEASE_AGREEMENT', label: 'Lease Agreements' },
    { value: 'TITLE_DEED', label: 'Title Deeds' },
    { value: 'BUSINESS_PERMIT', label: 'Business Permits' },
    { value: 'ID_DOCUMENT', label: 'ID Documents' },
    { value: 'TAX_COMPLIANCE', label: 'Tax Compliance' },
    { value: 'OTHER', label: 'Other' },
];

export default function DocumentsPage() {
    const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [filterType, setFilterType] = useState('');

    const filteredDocuments = filterType
        ? documents.filter(doc => doc.documentType === filterType)
        : documents;

    const handleUpload = async (file: File, documentType: string, propertyId?: string) => {
        await uploadDocument(file, documentType, propertyId);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-neutral-border rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-primary">My Documents</h1>
                    <p className="text-neutral-secondary mt-1">
                        Manage your property documents and lease agreements
                    </p>
                </div>
                <Button onClick={() => setShowUploadModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload
                </Button>
            </div>

            {documents.length > 0 && (
                <div className="mb-6">
                    <Select
                        label="Filter by Type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        options={DOCUMENT_TYPE_FILTERS}
                    />
                </div>
            )}

            {filteredDocuments.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title={filterType ? 'No Documents Found' : 'No Documents Yet'}
                    description={
                        filterType
                            ? 'Try adjusting your filter'
                            : 'Upload documents to keep your property files organized'
                    }
                    actionLabel={!filterType ? 'Upload Document' : undefined}
                    onAction={!filterType ? () => setShowUploadModal(true) : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocuments.map((doc, idx) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <DocumentCard document={doc} onDelete={deleteDocument} />
                        </motion.div>
                    ))}
                </div>
            )}

            <DocumentUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleUpload}
            />
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { FileText, Download, Trash2, Calendar, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import type { Document } from '@/lib/hooks/useDocuments';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    LEASE_AGREEMENT: 'Lease Agreement',
    TITLE_DEED: 'Title Deed',
    BUSINESS_PERMIT: 'Business Permit',
    ID_DOCUMENT: 'ID Document',
    TAX_COMPLIANCE: 'Tax Compliance',
    OTHER: 'Other',
};

interface DocumentCardProps {
    document: Document;
    onDelete: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDownload = () => {
        window.open(document.url, '_blank');
    };

    const handleDelete = () => {
        onDelete(document.id);
        setShowDeleteModal(false);
    };

    return (
        <>
            <Card className="p-4 hover:border-brand-primary transition-colors">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-brand-primary" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-neutral-primary truncate mb-1">
                                    {document.fileName}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-neutral-tertiary">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(document.uploadedAt)}
                                </div>
                            </div>
                            <Badge variant="secondary">
                                {DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
                            </Badge>
                        </div>

                        {document.property && (
                            <div className="flex items-center gap-2 text-sm text-neutral-secondary mb-3">
                                <Building2 className="w-4 h-4" />
                                <span className="truncate">{document.property.propertyName}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-tertiary">
                                {formatFileSize(document.fileSize)}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-status-error hover:text-status-error"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Document"
            >
                <div className="space-y-4">
                    <p className="text-neutral-secondary">
                        Are you sure you want to delete "{document.fileName}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleDelete} className="bg-status-error hover:bg-status-error/90">
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
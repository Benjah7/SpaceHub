'use client';

import React, { useState, useEffect } from 'react';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadModal } from './DocumentUploadModal';
import { Button } from '@/components/ui/Button';
import { Plus, FileText } from 'lucide-react';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { Document, DocumentType } from '@/types';

interface PropertyDocumentsProps {
    propertyId: string;
    isOwner: boolean;
}

const VERIFICATION_DOC_TYPES: DocumentType[] = [
    DocumentType.TITLE_DEED,
    DocumentType.BUSINESS_PERMIT,
    DocumentType.ID_DOCUMENT,
    DocumentType.TAX_COMPLIANCE,
];

const PUBLIC_DOC_TYPES: DocumentType[] = [
    DocumentType.LEASE_AGREEMENT,
    DocumentType.OTHER,
];

export const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({
    propertyId,
    isOwner,
}) => {
    const { documents, loading, uploadDocument, deleteDocument } = useDocuments(propertyId);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const visibleDocuments = documents.filter((doc) => {
        if (isOwner) return true;
        return PUBLIC_DOC_TYPES.includes(doc.documentType as DocumentType);
    }) as Document[];


    const handleUpload = async (file: File, documentType: DocumentType) => {
        await uploadDocument(file, documentType, propertyId);
        setShowUploadModal(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            await deleteDocument(id);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-neutral-border rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-neutral-border rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-primary">
                        Property Documents
                    </h2>
                    {isOwner && (
                        <p className="text-sm text-neutral-secondary mt-1">
                            Share helpful documents with potential tenants
                        </p>
                    )}
                    {!isOwner && (
                        <p className="text-sm text-neutral-secondary mt-1">
                            Documents shared by the property owner
                        </p>
                    )}
                </div>

                {/* Only owners can upload */}
                {isOwner && (
                    <Button
                        size="sm"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Document
                    </Button>
                )}
            </div>

            {/* ===== CHANGE documents to visibleDocuments ===== */}
            {visibleDocuments.length === 0 ? (
                <div className="text-center py-12 bg-neutral-bg rounded-xl border-2 border-dashed border-neutral-border">
                    <FileText className="w-12 h-12 mx-auto text-neutral-tertiary mb-3" />
                    <p className="text-neutral-secondary">
                        {isOwner
                            ? 'No documents uploaded yet. Share lease agreements or building rules with tenants.'
                            : 'No documents have been shared yet.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleDocuments.map((document) => (
                        <DocumentCard
                            key={document.id}
                            document={document}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <DocumentUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    // ===== ADD THIS: Restrict upload types for property docs =====
                    allowedTypes={PUBLIC_DOC_TYPES}
                    title="Upload Property Document"
                    description="Share documents that help tenants understand the property (lease templates, building rules, etc.)"
                />
            )}
        </div>
    );
};
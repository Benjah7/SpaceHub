'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DocumentType, DOCUMENT_TYPE_LABELS, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE } from '@/types';


interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, documentType: DocumentType) => Promise<void>;
    allowedTypes?: DocumentType[];
    title?: string;
    description?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    allowedTypes,
    title = 'Upload Document',
    description,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.LEASE_AGREEMENT);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS)
        .filter(([value]) => {
            if (allowedTypes && allowedTypes.length > 0) {
                return allowedTypes.includes(value as DocumentType);
            }
            return true;
        })
        .map(([value, label]) => ({ value, label }));

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);

        if (!selectedFile) return;

        if (!ALLOWED_DOCUMENT_TYPES.includes(selectedFile.type)) {
            setError('Only PDF and Word documents (.pdf, .doc, .docx) are allowed');
            return;
        }

        if (selectedFile.size > MAX_DOCUMENT_SIZE) {
            setError(`File size must be less than ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            await onUpload(file, documentType);
            handleClose();
        } catch (err) {
            setError((err as Error).message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setFile(null);
            setDocumentType(DocumentType.LEASE_AGREEMENT);
            setError(null);
            onClose();
        }
    };
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Document Type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                   options={documentTypeOptions}
                    required
                />
                {description && (
                    <p className="text-sm text-neutral-secondary mb-4">
                        {description}
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-primary mb-2">
                        Select File
                    </label>
                    <div
                        className="border-2 border-dashed border-neutral-border rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-brand-primary" />
                                <div className="text-left">
                                    <p className="font-medium text-neutral-primary">{file.name}</p>
                                    <p className="text-sm text-neutral-secondary">{formatFileSize(file.size)}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mx-auto text-neutral-tertiary mb-2" />
                                <p className="text-neutral-primary mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-neutral-secondary">PDF or Word (max {MAX_DOCUMENT_SIZE / (1024 * 1024)}MB)</p>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-status-error/10 border border-status-error rounded-lg">
                        <AlertCircle className="w-4 h-4 text-status-error" />
                        <p className="text-sm text-status-error">{error}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={uploading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" isLoading={uploading} disabled={!file}>
                        Upload
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
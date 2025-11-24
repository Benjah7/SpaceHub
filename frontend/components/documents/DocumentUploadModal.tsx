'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

const DOCUMENT_TYPES = [
    { value: 'LEASE_AGREEMENT', label: 'Lease Agreement' },
    { value: 'TITLE_DEED', label: 'Title Deed' },
    { value: 'BUSINESS_PERMIT', label: 'Business Permit' },
    { value: 'ID_DOCUMENT', label: 'ID Document' },
    { value: 'TAX_COMPLIANCE', label: 'Tax Compliance' },
    { value: 'OTHER', label: 'Other' },
];

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, documentType: string, propertyId?: string) => Promise<void>;
    propertyId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    propertyId,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState('LEASE_AGREEMENT');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);

        if (!selectedFile) return;

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError('Only PDF and Word documents are allowed');
            return;
        }

        if (selectedFile.size > MAX_SIZE) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            await onUpload(file, documentType, propertyId);
            handleClose();
        } catch (err) {
            setError('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setDocumentType('LEASE_AGREEMENT');
        setError(null);
        onClose();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Document Type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    options={DOCUMENT_TYPES}
                    required
                />

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
                                <p className="text-sm text-neutral-secondary">PDF or Word (max 10MB)</p>
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
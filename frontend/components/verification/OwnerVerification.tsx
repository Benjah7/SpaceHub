'use client';

import React, { useState } from 'react';
import { Shield, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store/auth-store';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentType } from '@/types';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

/**
 * Owner Verification Component
 * File: frontend/components/verification/OwnerVerification.tsx
 */

const VERIFICATION_DOC_TYPES = [
    DocumentType.TITLE_DEED,
    DocumentType.BUSINESS_PERMIT,
    DocumentType.ID_DOCUMENT,
    DocumentType.TAX_COMPLIANCE
];

export const OwnerVerification: React.FC = () => {
    const { user } = useAuthStore();
    const { documents, uploadDocument } = useDocuments();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [requesting, setRequesting] = useState(false);

    if (!user || user.role !== 'OWNER') return null;

    const verificationDocs = documents.filter(doc =>
        VERIFICATION_DOC_TYPES.includes(doc.documentType as DocumentType)
    );

    const handleRequestVerification = async () => {
        if (verificationDocs.length === 0) {
            toast.error('Please upload at least one verification document');
            return;
        }

        setRequesting(true);
        try {
            await apiClient.post('/verification/request');
            toast.success('Verification requested! We\'ll review within 24-48 hours');
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to request verification');
        } finally {
            setRequesting(false);
        }
    };

    const handleUpload = async (file: File, documentType: DocumentType) => {
        await uploadDocument(file, documentType);
        setShowUploadModal(false);
    };

    const getStatusDisplay = () => {
        switch (user.verificationStatus) {
            case 'VERIFIED':
                return {
                    icon: <CheckCircle className="w-6 h-6 text-status-success" />,
                    title: 'Account Verified',
                    description: 'Your account is verified. Enjoy increased visibility and trust!',
                    badge: <Badge variant="success">VERIFIED</Badge>
                };
            case 'PENDING':
                return {
                    icon: <Clock className="w-6 h-6 text-status-warning" />,
                    title: 'Verification Pending',
                    description: 'We\'re reviewing your documents. This usually takes 24-48 hours.',
                    badge: <Badge variant="warning">PENDING</Badge>
                };
            case 'REJECTED':
                return {
                    icon: <AlertCircle className="w-6 h-6 text-status-error" />,
                    title: 'Verification Rejected',
                    description: 'Please check your notifications for feedback and resubmit.',
                    badge: <Badge variant="error">REJECTED</Badge>
                };
            default:
                return {
                    icon: <Shield className="w-6 h-6 text-neutral-tertiary" />,
                    title: 'Get Verified',
                    description: 'Increase trust and visibility by verifying your account.',
                    badge: <Badge variant="default">UNVERIFIED</Badge>
                };
        }
    };

    const status = getStatusDisplay();

    return (
        <>
            <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    {status.icon}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{status.title}</h3>
                            {status.badge}
                        </div>
                        <p className="text-sm text-neutral-secondary">{status.description}</p>
                    </div>
                </div>

                {user.verificationStatus !== 'VERIFIED' && (
                    <>
                        <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm">Required Documents</h4>
                            <div className="space-y-2">
                                {[
                                    { type: 'ID_DOCUMENT', label: 'ID Document' },
                                    { type: 'BUSINESS_PERMIT', label: 'Business Permit' },
                                    { type: 'TITLE_DEED', label: 'Title Deed (Optional)' },
                                    { type: 'TAX_COMPLIANCE', label: 'Tax Compliance (Optional)' }
                                ].map(({ type, label }) => {
                                    const hasDoc = verificationDocs.some(d => d.documentType === type);
                                    return (
                                        <div key={type} className="flex items-center gap-2 text-sm">
                                            {hasDoc ? (
                                                <CheckCircle className="w-4 h-4 text-status-success" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-neutral-border" />
                                            )}
                                            <span className={hasDoc ? 'text-neutral-primary' : 'text-neutral-secondary'}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowUploadModal(true)}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Documents
                            </Button>

                            {user.verificationStatus !== 'PENDING' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleRequestVerification}
                                    disabled={verificationDocs.length === 0 || requesting}
                                    isLoading={requesting}
                                >
                                    Request Verification
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {user.verificationStatus === 'VERIFIED' && (
                    <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-4">
                        <p className="text-sm text-status-success font-medium">
                            ✓ Your properties display the verified badge
                        </p>
                    </div>
                )}
            </Card>

            {showUploadModal && (
                <DocumentUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    allowedTypes={VERIFICATION_DOC_TYPES}
                    title="Upload Verification Documents"
                    description="Upload your ID, business permit, or property ownership documents"
                />
            )}
        </>
    );
};
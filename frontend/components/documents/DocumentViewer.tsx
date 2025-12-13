'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface DocumentData {
    id: string;
    filename: string;
    url: string;
    type: string;
    createdAt: string;
}

interface DocumentViewerProps {
    document: DocumentData;
    isOpen: boolean;
    onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    document: doc,
    isOpen,
    onClose,
}) => {
    const [downloading, setDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [downloadError, setDownloadError] = useState(false);
    const hasDownloaded = useRef(false);

    const getFileExtension = (filename: string): string => {
        const match = filename.match(/\.([^.]+)$/);
        return match ? match[1].toLowerCase() : 'pdf';
    };

    const formatDocumentType = (type: string): string => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDownload = async (): Promise<void> => {
        setDownloading(true);
        setDownloadError(false);
        try {
            const response = await fetch(doc.url);

            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const anchor = window.document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = doc.filename;
            anchor.style.display = 'none';

            window.document.body.appendChild(anchor);
            anchor.click();

            // Cleanup
            setTimeout(() => {
                window.document.body.removeChild(anchor);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

            setDownloadComplete(true);
        } catch (err) {
            console.error('Download failed:', err);
            setDownloadError(true);
        } finally {
            setDownloading(false);
        }
    };

    // Auto-download only once when modal opens
    useEffect(() => {
        if (isOpen && !hasDownloaded.current) {
            hasDownloaded.current = true;
            handleDownload();
        }

        // Reset when modal closes
        if (!isOpen) {
            hasDownloaded.current = false;
            setDownloadComplete(false);
            setDownloadError(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
            <div className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        {downloading ? (
                            <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                        ) : downloadComplete ? (
                            <CheckCircle className="w-16 h-16 text-status-success" />
                        ) : downloadError ? (
                            <AlertCircle className="w-16 h-16 text-status-error" />
                        ) : (
                            <FileText className="w-16 h-16 text-brand-primary" />
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">{doc.filename}</h3>
                        <div className="flex items-center justify-center gap-3 text-sm text-neutral-secondary">
                            <span>{formatDocumentType(doc.type)}</span>
                            <span>•</span>
                            <span>Uploaded {formatDate(doc.createdAt)}</span>
                            <span>•</span>
                            <span>{getFileExtension(doc.filename).toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {downloading && (
                            <p className="text-neutral-secondary">Downloading document...</p>
                        )}

                        {downloadComplete && (
                            <p className="text-status-success font-medium">
                                Download complete! Check your downloads folder.
                            </p>
                        )}

                        {downloadError && (
                            <div className="space-y-2">
                                <p className="text-status-error font-medium">
                                    Download failed. Please try again.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    isLoading={downloading}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Retry Download
                                </Button>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                disabled={downloading}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
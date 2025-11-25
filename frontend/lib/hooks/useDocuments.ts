import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import toast from 'react-hot-toast';

export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    documentType: string;
    propertyId?: string;
    property?: {
        id: string;
        propertyName: string;
        address: string;
    };
    uploadedAt: string;
}

interface UseDocumentsReturn {
    documents: Document[];
    loading: boolean;
    error: Error | null;
    uploadDocument: (file: File, documentType: string, propertyId?: string) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export const useDocuments = (propertyId?: string): UseDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = propertyId
                ? await apiClient.getPropertyDocuments(propertyId)
                : await apiClient.getMyDocuments();
            setDocuments(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            ErrorHandler.handle(error);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const uploadDocument = async (
        file: File,
        documentType: string,
        propertyId?: string
    ): Promise<void> => {
        try {
            await apiClient.uploadDocument(file, documentType, propertyId);
            toast.success('Document uploaded successfully');
            await fetchDocuments();
        } catch (err) {
            const error = err as Error;
            ErrorHandler.handle(error);
            throw error;
        }
    };

    const deleteDocument = async (id: string): Promise<void> => {
        try {
            await apiClient.deleteDocument(id);
            toast.success('Document deleted successfully');
            await fetchDocuments();
        } catch (err) {
            const error = err as Error;
            ErrorHandler.handle(error);
            throw error;
        }
    };

    const getPropertyDocuments = async (propertyId: string): Promise<Document[]> => {
        try {
            const docs = await apiClient.getPropertyDocuments(propertyId);
            return docs;
        } catch (error) {
            ErrorHandler.handle(error as Error);
            return [];
        }
    };

    return {
        documents,
        loading,
        error,
        uploadDocument,
        deleteDocument,
        refetch: fetchDocuments,
    };
};
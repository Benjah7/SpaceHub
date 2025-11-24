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
    uploading: boolean;
    uploadDocument: (file: File, documentType: string, propertyId?: string) => Promise<Document | null>;
    deleteDocument: (id: string) => Promise<boolean>;
    getPropertyDocuments: (propertyId: string) => Promise<Document[]>;
    refresh: () => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.getMyDocuments();
            setDocuments(data);
        } catch (error) {
            ErrorHandler.handle(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const uploadDocument = async (
        file: File,
        documentType: string,
        propertyId?: string
    ): Promise<Document | null> => {
        try {
            setUploading(true);
            const document = await apiClient.uploadDocument(file, documentType, propertyId);
            setDocuments(prev => [document, ...prev]);
            toast.success('Document uploaded successfully');
            return document;
        } catch (error) {
            ErrorHandler.handle(error as Error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (id: string): Promise<boolean> => {
        try {
            await apiClient.deleteDocument(id);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            toast.success('Document deleted successfully');
            return true;
        } catch (error) {
            ErrorHandler.handle(error as Error);
            return false;
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
        uploading,
        uploadDocument,
        deleteDocument,
        getPropertyDocuments,
        refresh: fetchDocuments,
    };
};
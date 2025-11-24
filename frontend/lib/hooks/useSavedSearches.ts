import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import type { SavedSearch, SearchCriteria } from '@/types';
import toast from 'react-hot-toast';

interface UseSavedSearchesReturn {
    searches: SavedSearch[];
    loading: boolean;
    error: Error | null;
    createSearch: (name: string, criteria: SearchCriteria) => Promise<SavedSearch | null>;
    updateSearch: (id: string, name: string, criteria?: SearchCriteria) => Promise<boolean>;
    deleteSearch: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export const useSavedSearches = (): UseSavedSearchesReturn => {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSearches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getSavedSearches();
            setSearches(data);
        } catch (err) {
            const error = err as Error;
            setError(error);
            ErrorHandler.handle(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSearches();
    }, [fetchSearches]);

    const createSearch = async (
        name: string,
        criteria: SearchCriteria
    ): Promise<SavedSearch | null> => {
        try {
            const newSearch = await apiClient.createSavedSearch({ name, criteria });
            setSearches(prev => [newSearch, ...prev]);
            toast.success('Search saved successfully');
            return newSearch;
        } catch (err) {
            ErrorHandler.handle(err as Error);
            return null;
        }
    };

    const updateSearch = async (
        id: string,
        name: string,
        criteria?: SearchCriteria
    ): Promise<boolean> => {
        try {
            const updated = await apiClient.updateSavedSearch(id, { name, criteria });
            setSearches(prev =>
                prev.map(search => (search.id === id ? updated : search))
            );
            toast.success('Search updated successfully');
            return true;
        } catch (err) {
            ErrorHandler.handle(err as Error);
            return false;
        }
    };

    const deleteSearch = async (id: string): Promise<boolean> => {
        try {
            await apiClient.deleteSavedSearch(id);
            setSearches(prev => prev.filter(search => search.id !== id));
            toast.success('Search deleted successfully');
            return true;
        } catch (err) {
            ErrorHandler.handle(err as Error);
            return false;
        }
    };

    return {
        searches,
        loading,
        error,
        createSearch,
        updateSearch,
        deleteSearch,
        refresh: fetchSearches,
    };
};
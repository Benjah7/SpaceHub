'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SavedSearchCard } from '@/components/saved-searches/SavedSearchCard';
import { SaveSearchModal } from '@/components/saved-searches/SaveSearchModal';
import { useSavedSearches } from '@/lib/hooks/useSavedSearches';
import type { SavedSearch, SearchCriteria } from '@/types';

export default function SavedSearchesPage() {
    const { searches, loading, createSearch, updateSearch, deleteSearch } = useSavedSearches();
    const [showModal, setShowModal] = useState(false);
    const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

    const handleSave = async (name: string, criteria: SearchCriteria) => {
        if (editingSearch) {
            await updateSearch(editingSearch.id, name, criteria);
        } else {
            await createSearch(name, criteria);
        }
        setShowModal(false);
        setEditingSearch(null);
    };

    const handleEdit = (search: SavedSearch) => {
        setEditingSearch(search);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSearch(null);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-neutral-border rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-primary">
                        Saved Searches
                    </h1>
                    <p className="text-neutral-secondary mt-1">
                        Quickly access your favorite property searches
                    </p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Search
                </Button>
            </div>

            {searches.length === 0 ? (
                <EmptyState
                    icon={SearchIcon}
                    title="No Saved Searches"
                    description="Save your searches to quickly access them later"
                    actionLabel="Create Your First Search"
                    onAction={() => setShowModal(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searches.map((search, idx) => (
                        <motion.div
                            key={search.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <SavedSearchCard
                                search={search}
                                onDelete={deleteSearch}
                                onEdit={handleEdit}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            <SaveSearchModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={editingSearch || undefined}
            />
        </div>
    );
}
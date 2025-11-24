import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Property } from '@/types';

interface ComparisonStore {
    properties: Property[];
    addProperty: (property: Property) => void;
    removeProperty: (propertyId: string) => void;
    clearComparison: () => void;
    isInComparison: (propertyId: string) => boolean;
    canAddMore: () => boolean;
}

const MAX_COMPARISON = 4;

export const useComparisonStore = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            properties: [],

            addProperty: (property) => {
                const { properties, canAddMore, isInComparison } = get();

                if (!canAddMore()) {
                    return;
                }

                if (isInComparison(property.id)) {
                    return;
                }

                set({ properties: [...properties, property] });
            },

            removeProperty: (propertyId) => {
                set((state) => ({
                    properties: state.properties.filter((p) => p.id !== propertyId),
                }));
            },

            clearComparison: () => {
                set({ properties: [] });
            },

            isInComparison: (propertyId) => {
                return get().properties.some((p) => p.id === propertyId);
            },

            canAddMore: () => {
                return get().properties.length < MAX_COMPARISON;
            },
        }),
        {
            name: 'space-hub-comparison',
        }
    )
);
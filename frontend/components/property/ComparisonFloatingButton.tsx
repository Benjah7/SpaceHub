'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Scale, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useComparisonStore } from '@/lib/store/comparison-store';

export const ComparisonFloatingButton: React.FC = () => {
    const router = useRouter();
    const { properties, clearComparison } = useComparisonStore();

    if (properties.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="bg-white rounded-xl shadow-2xl border-2 border-brand-primary p-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                            {properties.length}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-neutral-primary">
                                Properties Selected
                            </p>
                            <p className="text-xs text-neutral-secondary">
                                Ready to compare
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => router.push('/compare')}
                        >
                            <Scale className="w-4 h-4 mr-2" />
                            Compare Now
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearComparison}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
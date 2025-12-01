'use client'

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyPayment {
    propertyId: number;
    propertyName: string;
    totalReceived: number;
    pendingAmount: number;
    paymentCount: number;
    recentPayments: Array<{
        id: number;
        amount: number;
        paymentType: string;
        status: string;
        mpesaReceiptNumber: string | null;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
    }>;
}

export default function OwnerPaymentDashboard() {
    const [properties, setProperties] = useState<PropertyPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRevenue: 0,
        totalPayments: 0
    });

    useEffect(() => {
        fetchOwnerPayments();
    }, []);

    const fetchOwnerPayments = async () => {
        try {
            // Fetch owner's properties
            const propsRes = await fetch('/api/properties/owner/properties', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const propsData = await propsRes.json();

            // Fetch payments for each property
            const paymentsPromises = propsData.data.map(async (prop: any) => {
                const res = await fetch(`/api/properties/${prop.id}/payments`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();

                const payments = data.data || [];
                const completed = payments.filter((p: any) => p.status === 'COMPLETED');
                const pending = payments.filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING');

                return {
                    propertyId: prop.id,
                    propertyName: prop.propertyName,
                    totalReceived: completed.reduce((sum: number, p: any) => sum + p.amount, 0),
                    pendingAmount: pending.reduce((sum: number, p: any) => sum + p.amount, 0),
                    paymentCount: completed.length,
                    recentPayments: payments.slice(0, 5)
                };
            });

            const propertyPayments = await Promise.all(paymentsPromises);
            setProperties(propertyPayments);

            // Calculate stats
            setStats({
                totalRevenue: propertyPayments.reduce((sum, p) => sum + p.totalReceived, 0),
                pendingRevenue: propertyPayments.reduce((sum, p) => sum + p.pendingAmount, 0),
                totalPayments: propertyPayments.reduce((sum, p) => sum + p.paymentCount, 0)
            });

        } catch (err) {
            console.error('Failed to fetch payments:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8" />
                            <span className="text-green-100 text-sm">Total Revenue</span>
                        </div>
                        <p className="text-3xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <AlertCircle className="w-8 h-8" />
                            <span className="text-orange-100 text-sm">Pending</span>
                        </div>
                        <p className="text-3xl font-bold">KES {stats.pendingRevenue.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-8 h-8" />
                            <span className="text-blue-100 text-sm">Total Payments</span>
                        </div>
                        <p className="text-3xl font-bold">{stats.totalPayments}</p>
                    </motion.div>
                </div>

                {/* Property Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Payments by Property</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {properties.map((property) => (
                            <div key={property.propertyId} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{property.propertyName}</h3>
                                        <p className="text-sm text-gray-500">{property.paymentCount} payments</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">
                                            KES {property.totalReceived.toLocaleString()}
                                        </p>
                                        {property.pendingAmount > 0 && (
                                            <p className="text-sm text-orange-600">
                                                +{property.pendingAmount.toLocaleString()} pending
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Payments */}
                                {property.recentPayments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase">Recent Payments</p>
                                        {property.recentPayments.map((payment) => (
                                            <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{payment.user.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {payment.paymentType} • {new Date(payment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">KES {payment.amount.toLocaleString()}</p>
                                                    <span className={`text-xs ${payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
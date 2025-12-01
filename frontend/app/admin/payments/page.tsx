'use client'

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, Users, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentStats {
    totalRevenue: number;
    completedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    todayRevenue: number;
    monthRevenue: number;
}

interface Payment {
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
    property: {
        propertyName: string;
        ownerId: number;
    };
}

export default function AdminPaymentOverview() {
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    useEffect(() => {
        fetchPaymentData();
    }, [filter]);

    const fetchPaymentData = async () => {
        try {
            const res = await fetch(`/api/admin/payments?filter=${filter}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();

            if (data.success) {
                setStats(data.data.stats);
                setPayments(data.data.payments);
            }
        } catch (err) {
            console.error('Failed to fetch payment data:', err);
        } finally {
            setLoading(false);
        }
    };

    const exportPayments = () => {
        // Convert to CSV and download
        const csv = [
            ['ID', 'Date', 'User', 'Property', 'Type', 'Amount', 'Status', 'Receipt'],
            ...payments.map(p => [
                p.id,
                new Date(p.createdAt).toLocaleString(),
                p.user.name,
                p.property.propertyName,
                p.paymentType,
                p.amount,
                p.status,
                p.mpesaReceiptNumber || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading || !stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Payment Analytics</h1>
                    <button
                        onClick={exportPayments}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">
                            KES {stats.totalRevenue.toLocaleString()}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">This Month</p>
                        <p className="text-2xl font-bold text-gray-800">
                            KES {stats.monthRevenue.toLocaleString()}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.completedPayments}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {stats.failedPayments} failed, {stats.pendingPayments} pending
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Today</p>
                        <p className="text-2xl font-bold text-gray-800">
                            KES {stats.todayRevenue.toLocaleString()}
                        </p>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {['all', 'today', 'week', 'month'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-800">{payment.user.name}</div>
                                            <div className="text-xs text-gray-500">{payment.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {payment.property.propertyName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {payment.paymentType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            KES {payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                                            {payment.mpesaReceiptNumber || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
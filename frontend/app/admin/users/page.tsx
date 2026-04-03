'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import api from '@/lib/api';

interface User {
    _id: string;
    email: string;
    profileApproved: boolean;
    isSuspended: boolean;
    subscription?: { plan: string };
}

interface ConfirmModal {
    open: boolean;
    type: 'suspend' | 'unsuspend' | 'delete';
    userId: string;
    userEmail: string;
}

const PAGE_SIZE = 25;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [modal, setModal] = useState<ConfirmModal>({ open: false, type: 'suspend', userId: '', userEmail: '' });
    const [actionLoading, setActionLoading] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', {
                params: { page, limit: PAGE_SIZE, search: debouncedSearch }
            });
            if (res.data.success) {
                setUsers(res.data.users);
                setTotal(res.data.pagination.total);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openModal = (type: ConfirmModal['type'], userId: string, userEmail: string) => {
        setModal({ open: true, type, userId, userEmail });
    };

    const closeModal = () => {
        setModal({ open: false, type: 'suspend', userId: '', userEmail: '' });
    };

    const handleConfirm = async () => {
        setActionLoading(true);
        try {
            if (modal.type === 'delete') {
                await api.delete(`/admin/users/${modal.userId}`);
            } else {
                await api.post(`/admin/users/${modal.userId}/suspend`, {
                    suspend: modal.type === 'suspend'
                });
            }
            closeModal();
            fetchUsers();
        } catch {
            alert('Action failed. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative w-full max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-spiritual-violet-500 text-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spiritual-violet-600" />
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-neutral-900 dark:text-white text-sm">Email</th>
                                    <th className="text-left py-4 px-6 font-semibold text-neutral-900 dark:text-white text-sm hidden md:table-cell">Profile</th>
                                    <th className="text-left py-4 px-6 font-semibold text-neutral-900 dark:text-white text-sm hidden lg:table-cell">Subscription</th>
                                    <th className="text-left py-4 px-6 font-semibold text-neutral-900 dark:text-white text-sm">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-neutral-900 dark:text-white text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-neutral-400 dark:text-neutral-500">
                                            No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}
                                        </td>
                                    </tr>
                                ) : users.map(u => (
                                    <tr key={u._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                        <td className="py-4 px-6 text-neutral-900 dark:text-neutral-100">
                                            <p className="font-medium text-sm">{u.email}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 md:hidden">{u.subscription?.plan || 'Free'}</p>
                                        </td>
                                        <td className="py-4 px-6 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.profileApproved
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                {u.profileApproved ? '✓ Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 hidden lg:table-cell">
                                            <span className="text-neutral-700 dark:text-neutral-300 text-sm capitalize">
                                                {u.subscription?.plan || 'Free'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.isSuspended
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                }`}>
                                                {u.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal(u.isSuspended ? 'unsuspend' : 'suspend', u._id, u.email)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors font-medium"
                                                >
                                                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => openModal('delete', u._id, u.email)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/20">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page
                                                        ? 'bg-spiritual-violet-600 text-white'
                                                        : 'border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirm Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${modal.type === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                                    <AlertTriangle size={20} className={modal.type === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white capitalize">
                                    {modal.type === 'delete' ? 'Delete User' : modal.type === 'suspend' ? 'Suspend User' : 'Unsuspend User'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            {modal.type === 'delete' && 'This action is permanent and cannot be undone. All user data including profile, matches, and messages will be deleted.'}
                            {modal.type === 'suspend' && 'This user will be suspended and will not be able to access the platform.'}
                            {modal.type === 'unsuspend' && 'This will restore the user\'s access to the platform.'}
                        </p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mt-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg px-3 py-2">
                            {modal.userEmail}
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={actionLoading}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50 ${modal.type === 'delete'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : modal.type === 'suspend'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {actionLoading ? 'Processing...' : modal.type === 'delete' ? 'Yes, Delete' : modal.type === 'suspend' ? 'Yes, Suspend' : 'Yes, Unsuspend'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.message || 'Invalid access token');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Lock className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Access</h1>
                    <p className="text-gray-500 mt-2 text-sm">Enter your access token to continue</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                                Access Token
                            </label>
                            <input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="••••••••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-800 bg-gray-50 focus:bg-white"
                                required
                                suppressHydrationWarning
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'Verifying...'
                            ) : (
                                <>
                                    Access Dashboard <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { SpiritualUnityLogo } from './SpiritualUnityLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function DefaultNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const navItems = [
        { name: 'Home', link: '/' },
        { name: 'About Us', link: '#about' }, // Assuming it scrolls to an ID
        { name: 'Features', link: '#features' },
        { name: 'Pricing', link: '/plans' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-purple-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo Section */}
                    <div className="flex flex-shrink-0 items-center">
                        <SpiritualUnityLogo />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.link}
                                className="text-gray-700 hover:text-purple-600 font-medium transition-colors text-sm uppercase tracking-wide"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <Link
                                href="/matches/suggested"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-purple-600 font-bold transition-colors text-sm uppercase tracking-wide"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105"
                                >
                                    Join Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-purple-600 focus:outline-none p-2"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-lg absolute w-full left-0 top-20 flex flex-col items-center py-6 space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.link}
                            className="text-gray-800 hover:text-purple-600 font-bold text-lg uppercase tracking-wide px-4 py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="w-full h-px bg-purple-100 my-2"></div>

                    {user ? (
                        <Link
                            href="/matches/suggested"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-base uppercase tracking-widest shadow-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Enter Dashboard
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 w-full px-8 mt-2">
                            <Link
                                href="/auth/login"
                                className="w-full text-center border-2 border-purple-200 text-purple-600 px-6 py-3 rounded-full font-bold text-base uppercase tracking-widest"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/register"
                                className="w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-base uppercase tracking-widest shadow-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Start Journey
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

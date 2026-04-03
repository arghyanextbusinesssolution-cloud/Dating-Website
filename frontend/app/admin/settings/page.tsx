'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const Toggle = ({ enabled, onChange, label }: { enabled: boolean; onChange: (val: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between group">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-[#8b5cf6]/50 ${enabled ? 'bg-[#8b5cf6]' : 'bg-gray-200 dark:bg-neutral-700'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

const SectionHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20 shadow-inner">
            {icon}
        </div>
        <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-0.5 opacity-70">{subtitle}</p>
        </div>
    </div>
);

const InputField = ({ label, placeholder, type = "text", value, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-5 py-3 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-white/60 dark:border-neutral-700/60 text-gray-900 dark:text-white font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 transition-all text-sm"
        />
    </div>
);

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Spiritual Dating',
        supportEmail: 'support@spiritualdating.com',
        timezone: 'UTC +5:30',
        allowRegistration: true,
        requireVerification: true,
        minAge: '18',
        maintenanceMode: false,
        maintenanceMessage: 'Our soulful servers are taking a short rest. We\'ll be back soon!',
        enableReporting: true,
        autoSuspendCount: '5',
        defaultRole: 'User',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpEmail: 'notifications@spiritualdating.com',
        senderName: 'Spiritual Dating Team'
    });

    const updateSetting = (key: string, val: any) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-10 pb-20 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20 shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Platform Settings</h1>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-70">Control the energy of your platform</p>
                    </div>
                </div>
                <button className="mt-6 md:mt-0 px-10 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.05] active:scale-95 transition-all">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* General Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 p-8 md:p-10 shadow-xl"
                >
                    <SectionHeader
                        title="General"
                        subtitle="Core Branding & Info"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }
                    />
                    <div className="space-y-6">
                        <InputField label="Site Name" value={settings.siteName} onChange={(v: any) => updateSetting('siteName', v)} placeholder="e.g. SoulConnect" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Site Logo</label>
                                <div className="h-14 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all cursor-pointer">
                                    Upload SVG/PNG
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Favicon</label>
                                <div className="h-14 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-gray-400 hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all cursor-pointer">
                                    Upload ICO
                                </div>
                            </div>
                        </div>
                        <InputField label="Support Email" value={settings.supportEmail} onChange={(v: any) => updateSetting('supportEmail', v)} placeholder="e.g. hello@site.com" />
                        <InputField label="Timezone / Date Format" value={settings.timezone} onChange={(v: any) => updateSetting('timezone', v)} placeholder="e.g. UTC +5:30" />
                    </div>
                </motion.div>

                {/* Registration Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 p-8 md:p-10 shadow-xl"
                >
                    <SectionHeader
                        title="Registration"
                        subtitle="User Access Controls"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        }
                    />
                    <div className="space-y-6">
                        <Toggle label="Allow New User Registration" enabled={settings.allowRegistration} onChange={(v) => updateSetting('allowRegistration', v)} />
                        <Toggle label="Require Email Verification" enabled={settings.requireVerification} onChange={(v) => updateSetting('requireVerification', v)} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Minimum Age" type="number" value={settings.minAge} onChange={(v: any) => updateSetting('minAge', v)} placeholder="18" />
                            <InputField label="Default User Role" value={settings.defaultRole} onChange={(v: any) => updateSetting('defaultRole', v)} placeholder="User" />
                        </div>
                    </div>
                </motion.div>

                {/* Maintenance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 p-8 md:p-10 shadow-xl"
                >
                    <SectionHeader
                        title="Maintenance"
                        subtitle="System Availability"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />
                    <div className="space-y-6">
                        <Toggle label="Maintenance Mode" enabled={settings.maintenanceMode} onChange={(v) => updateSetting('maintenanceMode', v)} />
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maintenance Message</label>
                            <textarea
                                value={settings.maintenanceMessage}
                                onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                                placeholder="Share a message with your users..."
                                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-neutral-800/50 border border-white/60 dark:border-neutral-700/60 text-gray-900 dark:text-white font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none h-24 resize-none text-sm"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Moderation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 p-8 md:p-10 shadow-xl"
                >
                    <SectionHeader
                        title="Moderation"
                        subtitle="Platform Safety"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                    />
                    <div className="space-y-6">
                        <Toggle label="Enable Message Reporting" enabled={settings.enableReporting} onChange={(v) => updateSetting('enableReporting', v)} />
                        <InputField label="Auto Suspend After X Reports" type="number" value={settings.autoSuspendCount} onChange={(v: any) => updateSetting('autoSuspendCount', v)} placeholder="5" />
                    </div>
                </motion.div>

                {/* SMTP Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl rounded-[40px] border border-white/70 dark:border-neutral-800/70 md:col-span-2 p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <SectionHeader
                        title="SMTP Email Configuration"
                        subtitle="Notification Infrastructure"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <InputField label="SMTP Host" value={settings.smtpHost} onChange={(v: any) => updateSetting('smtpHost', v)} placeholder="smtp.gmail.com" />
                        <InputField label="SMTP Port" value={settings.smtpPort} onChange={(v: any) => updateSetting('smtpPort', v)} placeholder="587" />
                        <InputField label="SMTP Email" value={settings.smtpEmail} onChange={(v: any) => updateSetting('smtpEmail', v)} placeholder="notifications@site.com" />
                        <InputField label="SMTP Password" type="password" value="********" onChange={() => { }} placeholder="Enter password" />
                        <InputField label="Sender Display Name" value={settings.senderName} onChange={(v: any) => updateSetting('senderName', v)} placeholder="Spiritual Dating Team" />
                    </div>
                    <div className="mt-10 flex justify-end">
                        <button className="px-8 py-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                            Test SMTP Connection
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

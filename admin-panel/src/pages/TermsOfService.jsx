import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30 relative">
            {/* Animated Mesh Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[80px] bg-sky-500/10 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[80px] bg-indigo-500/10 opacity-60 animate-pulse delay-700"></div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                    <span>Go Back</span>
                </button>

                <div className="theme-panel p-8 md:p-12 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>
                    <p className="text-slate-400 mb-8">Effective Date: February 16, 2026</p>

                    <div className="space-y-10 text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using ConnectHub, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">2. Description of Service</h2>
                            <p>
                                ConnectHub provides a synchronization bridge that allows users to send SMS data from their
                                Android devices to a private web-based dashboard. This service is intended for personal
                                use and organizational management.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">3. User Obligations</h2>
                            <p className="mb-4">
                                You agree that you will not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li>Use the service for any illegal purposes or to facilitate illegal activities.</li>
                                <li>Attempt to intercept messages from devices you do not legally own or have permission to monitor.</li>
                                <li>Interfere with or disrupt the integrity or performance of the service.</li>
                                <li>Reverse engineer the mobile application or backend services.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">4. Device Ownership</h2>
                            <p>
                                By connecting a device to ConnectHub, you represent and warrant that you are the primary
                                user of the device or have the express legal authority from the device owner to synchronize
                                its SMS data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">5. Limitation of Liability</h2>
                            <p>
                                ConnectHub is provided "as is" without any warranties. We are not liable for any data loss,
                                delays in SMS synchronization, or security breaches resulting from user negligence
                                (e.g., sharing account credentials).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">6. Service Modifications</h2>
                            <p>
                                We reserve the right to modify or terminate the service for any reason, without notice,
                                at any time. We may also revise these Terms of Service periodically. Your continued use
                                of the service after such changes constitutes acceptance of the new terms.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-500 text-sm">
                    &copy; 2026 ConnectHub Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;

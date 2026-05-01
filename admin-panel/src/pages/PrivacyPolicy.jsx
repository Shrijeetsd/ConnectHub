import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400 mb-8">Last Updated: February 16, 2026</p>

                    <div className="space-y-10 text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to ConnectHub. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we handle your personal data when you use our SMS
                                receiving and synchronization services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">2. Data We Collect</h2>
                            <p className="mb-4">
                                To provide our synchronization services, we collect the following types of information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><span className="text-white font-medium">SMS Records</span>: We sync SMS messages received on your connected devices to your private dashboard.</li>
                                <li><span className="text-white font-medium">Device Metadata</span>: Device ID, model name, and connection status to manage your hardware integration.</li>
                                <li><span className="text-white font-medium">Account Information</span>: Your email address and encrypted password for authentication.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">3. How We Use Your Data</h2>
                            <p className="mb-4">
                                Your data is used exclusively for the operation of the ConnectHub platform:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Facilitating real-time SMS synchronization between your phone and the web panel.</li>
                                <li>Authenticating your access to protected data.</li>
                                <li>Informing you about critical system updates or security alerts.</li>
                            </ul>
                            <p className="mt-4 italic text-sm text-slate-500">
                                ConnectHub does NOT sell, trade, or share your data with advertisers or third-party marketing firms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">4. Data Security</h2>
                            <p>
                                We implement industry-standard encryption (AES-256) for data transmission and secure cryptographic hashing
                                for passwords. Your SMS messages are stored in a secure cloud environment protected by strict firewall rules
                                and access controls.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">5. Your Rights</h2>
                            <p>
                                You have the right to access, correct, or delete your data at any time through your dashboard settings.
                                You can disconnect any device or delete your entire account, which will permanently purge your synchronized
                                records from our servers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">6. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at
                                <span className="text-indigo-400"> privacy@connecthubapp.bond</span>.
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

export default PrivacyPolicy;

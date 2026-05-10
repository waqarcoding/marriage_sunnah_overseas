import * as React from "react";
import AppBar from "./appbar";

/**
 * Marriage Sunna Overseas - How It Works & About Page
 * Created now to provide information and onboarding content for users.
 */

export default function HowItWorks() {
    return (
        <div>


            <AppBar
                onLogout={() => { }}
                onSidebarLogout={() => { }}
                isScrolled={true} isopacityon={false} />
            <div className="container mx-auto max-w-3xl px-4 py-12 mt-10" id="how-it-works">
                <h1 className="text-3xl font-bold text-center mb-4">
                    Marriage Sunna Overseas
                </h1>
                <h2 className="text-xl font-semibold text-center text-primary mb-6">
                    Global Muslim Matrimonial Platform
                </h2>
                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">About Us</h3>
                    <p className="text-base mb-2">
                        Marriage Sunna Overseas is a trusted matrimonial platform designed to connect Muslim families around the world in a respectful, secure, and Shariah-compliant environment.
                    </p>
                    <p className="text-base mb-2">
                        Our mission is to facilitate meaningful marriages by bringing together families from Pakistan, the United Arab Emirates, GCC countries, Europe, and North America, while maintaining Islamic values, privacy, and authenticity.
                    </p>
                    <p className="text-base mb-2">
                        We aim to modernize matrimonial services through technology, verified profiles, and family-oriented matchmaking, ensuring that individuals find compatible life partners with dignity and trust.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Our Vision</h3>
                    <p className="text-base">
                        To become a globally recognized Muslim matrimonial platform, helping families connect across borders while upholding Islamic principles and cultural traditions.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Our Mission</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li>To provide a secure and verified matchmaking platform</li>
                        <li>To promote Sunna-based marriages</li>
                        <li>To connect overseas Muslim families with trusted Pakistani families</li>
                        <li>To ensure privacy, dignity, and family involvement in the marriage process</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Our Services</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li><strong>Verified Matrimonial Profiles:</strong> All profiles are carefully reviewed to ensure authenticity and trust.</li>
                        <li><strong>Family Managed Profiles:</strong> Parents and guardians can manage profiles to ensure respectful communication.</li>
                        <li><strong>Overseas Matchmaking:</strong> Connecting Muslims living in UAE, GCC, Europe, and the USA with families in Pakistan.</li>
                        <li><strong>Privacy Protection:</strong> Profile photos can remain private or blurred until both families agree to connect.</li>
                        <li><strong>Premium Matchmaking Support:</strong> Dedicated support to help families find suitable matches efficiently.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Target Community</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li>Pakistani families worldwide</li>
                        <li>Muslims living in UAE, Saudi Arabia, Qatar, Oman, Bahrain, Kuwait</li>
                        <li>Pakistani diaspora in Europe and North America</li>
                    </ul>
                </section>



                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Key Features</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li>✔ Verified user profiles</li>
                        <li>✔ Privacy-controlled photo viewing</li>
                        <li>✔ Family-based matchmaking</li>
                        <li>✔ International matchmaking</li>
                        <li>✔ Islamic marriage guidance</li>
                        <li>✔ Secure digital platform</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Digital Platform</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li>Official Website: <a href="https://marriagesunnaoverseas.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://marriagesunnaoverseas.com</a></li>
                        <li>Android Mobile Application</li>
                        <li>IOS Mobile Application</li>
                        <li>Social Media Marketing</li>
                        <li>SEO & Digital Advertising</li>
                        <li>Direct family consultation services</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Our Core Values</h3>
                    <ul className="list-disc pl-6 text-base space-y-1">
                        <li><strong>Integrity</strong> – Honest and transparent matchmaking</li>
                        <li><strong>Privacy</strong> – Respecting family dignity</li>
                        <li><strong>Trust</strong> – Verified and secure profiles</li>
                        <li><strong>Faith</strong> – Following Islamic values and traditions</li>
                    </ul>
                </section>

                <section className="mb-8 text-center">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Launch Announcement</h3>
                    <p className="text-base mb-2">
                        Marriage Sunna Overseas is preparing to launch globally to connect Muslim families with a trusted and modern matrimonial platform.
                    </p>

                </section>
            </div>
        </div>
    );
}
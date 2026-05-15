// @ts-nocheck
import { Card, CardContent } from "../../ui/card";
import * as React from "react";
import { motion } from "framer-motion";




import {
    Heart, Shield, Globe, Users, CheckCircle, Star, Sparkles,
    KeyRound, MessageCircle, UserCheck, ArrowRight, Quote,
    Lock, BookOpen, HeartHandshake, Award, ChevronDown, Mail,
    Phone, MapPin, Instagram, Facebook, Twitter, BadgeCheck, Linkedin, Youtube
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import AppBar from "./appbar";
import settings from "../../context/settings";

export default function Landing() {
    const handleLearnHowItWorks = (e) => {
        e?.preventDefault?.();
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    };
    const go = (path) => {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    };
    const comingSoon = (p) => toast(`${p} app — coming soon, inshaAllah!`, { icon: p === "App Store" ? "🍎" : "🤖" });

    const [openFaq, setOpenFaq] = React.useState(0);

    return (
        <div className="min-h-screen flex flex-col">
            <div className="min-h-screen bg-background">
                <AppBar onLogout={() => { }} onSidebarLogout={() => { }} isScrolled={true} isopacityon={true} />

                {/* ── Hero ─── */}
                <section className="relative min-h-screen flex items-center overflow-hidden">

                    {/* ── Background image ── */}
                    <div className="absolute inset-0">
                        <img
                            src="/hero-section.png"
                            alt="Marriage Sunna Overseas"
                            className="
                h-full w-full object-cover
                object-[83%_top] sm:object-[85%_center] md:object-right
            "
                        />

                        {/* MOBILE: strong dark gradient bottom-up so text dominates */}
                        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-[#1B4D3E]/40 via-[#1B4D3E]/85 to-[#0d2a23]/95" />

                        {/* DESKTOP: side gradient (left dark, right transparent) */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#1B4D3E]/90 via-[#1B4D3E]/55 to-transparent" />
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#0d2a23]/40 via-transparent to-transparent" />
                    </div>

                    {/* Decorative glows — desktop only */}
                    <div className="hidden md:block absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-300/8 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-32 left-10 w-40 h-40 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none" />

                    {/* Subtle ornament — desktop only */}
                    <svg
                        className="absolute top-1/2 left-[42%] -translate-y-1/2 w-[420px] h-[420px] opacity-[0.06] pointer-events-none hidden lg:block"
                        viewBox="0 0 200 200" fill="none" aria-hidden="true">
                        <circle cx="100" cy="100" r="98" stroke="#fbbf24" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="80" stroke="#fbbf24" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="62" stroke="#fbbf24" strokeWidth="0.5" />
                        <path d="M100 2 L130 100 L100 198 L70 100 Z" stroke="#fbbf24" strokeWidth="0.5" fill="none" />
                        <path d="M2 100 L100 70 L198 100 L100 130 Z" stroke="#fbbf24" strokeWidth="0.5" fill="none" />
                    </svg>

                    {/* ── Content ── */}
                    <div className="relative z-10 container mx-auto px-5 sm:px-6 pt-20 pb-12 md:py-24">

                        {/* MOBILE: faded couple peek at top (decorative, smaller) */}
                        {/* — handled by image positioning — couple is at top on mobile */}

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-3xl"
                        >
                            {/* Eyebrow pill */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md text-white/95 text-xs sm:text-sm mb-5 sm:mb-6 border border-white/20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                                </span>
                                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                                <span className="whitespace-nowrap">Halal & Family-Centric</span>
                            </motion.div>

                            {/* Headline — responsive sizes */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="font-serif font-bold text-white leading-[1.05] mb-5 sm:mb-6 text-[40px] sm:text-5xl md:text-6xl lg:text-7xl"
                                style={{ letterSpacing: "-0.02em" }}
                            >
                                Find Your<br className="sm:hidden" /> Partner <br />
                                <span className="bg-gradient-to-r from-emerald-200 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
                                    with Dignity & Sunna
                                </span>
                            </motion.h1>

                            {/* Description — slightly smaller on mobile */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-[15px] sm:text-lg md:text-xl text-white/85 max-w-xl leading-relaxed mb-8 sm:mb-10"
                            >
                                Marriage Sunna Overseas connects Muslim families across borders.
                                We prioritize privacy, guardian involvement, and Islamic values.
                            </motion.p>

                            {/* CTAs — full width on mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10"
                            >
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="h-13 sm:h-14 px-6 sm:px-10 text-base sm:text-lg bg-white text-emerald-900 hover:bg-white/95 shadow-2xl shadow-black/30 hover:-translate-y-0.5 transition-all font-semibold group w-full sm:w-auto"
                                    onClick={() => go("/register")}
                                >
                                    Start Your Journey
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-13 sm:h-14 px-6 sm:px-10 text-base sm:text-lg border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-md hover:border-white/50 transition-all w-full sm:w-auto"
                                    onClick={handleLearnHowItWorks}
                                >
                                    Learn How It Works
                                </Button>
                            </motion.div>

                            {/* App download */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <AppDownloadRow comingSoon={comingSoon} />
                            </motion.div>

                            {/* Trust badges — wrap nicely on mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 sm:mt-10 grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-white/75 text-xs sm:text-sm"
                            >
                                <span className="flex items-center gap-1.5">
                                    <BadgeCheck className="h-4 w-4 text-emerald-300 shrink-0" />
                                    <span className="truncate">Verified</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Lock className="h-4 w-4 text-emerald-300 shrink-0" />
                                    <span className="truncate">Encrypted</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Shield className="h-4 w-4 text-emerald-300 shrink-0" />
                                    <span className="truncate">Trusted</span>
                                </span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Scroll indicator — desktop only */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/50"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
                        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent">
                            <motion.div
                                animate={{ y: [0, 30, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1 h-1 rounded-full bg-amber-300 -ml-0.5"
                            />
                        </div>
                    </motion.div>


                    {/* Bottom fade — softer on mobile */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                </section>
                {/* ── Stats ─── */}
                <section className="py-14 bg-primary/5 border-y border-primary/10">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { number: "5,000+", label: "Registered Families" },
                                { number: "1,200+", label: "Successful Matches" },
                                { number: "50+", label: "Countries" },
                                { number: "100%", label: "Halal Process" },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1" style={{ letterSpacing: "-0.02em" }}>{stat.number}</div>
                                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <SectionHeader eyebrow="Our Values" title="Why Choose" highlight="Marriage Sunna?" subtitle="We follow the principles of Islamic marriage to create a respectful, transparent, and family-oriented experience." />
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Shield, title: "Privacy First", desc: "Photos are blurred by default. Full visibility is granted only after mutual interest and family approval.", color: "bg-blue-500/10 text-blue-600" },
                                { icon: Users, title: "Guardian Verified", desc: "We encourage guardian (Wali) involvement from day one to ensure a respectful and serious process.", color: "bg-amber-500/10 text-amber-600" },
                                { icon: Globe, title: "Global Reach", desc: "Connecting compatible families from overseas with shared values and cultural understanding.", color: "bg-emerald-500/10 text-emerald-600" },
                            ].map((feature, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                                    <Card className="h-full hover:shadow-xl transition-all border-primary/10 hover:border-primary/30 hover:-translate-y-1 duration-300">
                                        <CardContent className="p-8">
                                            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                                {React.createElement(feature.icon, { className: "h-7 w-7" })}
                                            </div>
                                            <h3 className="font-serif text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── How It Works ─── */}
                <section id="how-it-works" className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <SectionHeader eyebrow="Process" title="How It" highlight="Works" subtitle="A simple, dignified process rooted in Islamic principles" />
                        <div className="grid md:grid-cols-4 gap-6 relative">
                            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px border-t-2 border-dashed border-primary/20" />
                            {[
                                { step: "1", icon: UserCheck, title: "Create Profile", desc: "Register with your guardian details and preferences" },
                                { step: "2", icon: Users, title: "Link Guardian", desc: "Connect your guardian (Wali) to enable family security" },

                                { step: "3", icon: Heart, title: "Express Interest", desc: "Send interest requests with guardian approval" },
                                { step: "4", icon: MessageCircle, title: "Connect", desc: "Message and arrange meetings after mutual acceptance" },
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center relative">
                                    <div className="relative inline-block mb-4">
                                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                                            {React.createElement(item.icon, { className: "h-7 w-7" })}
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-emerald-900 text-xs font-bold flex items-center justify-center shadow-md">{item.step}</span>
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px] mx-auto">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Sunna Values ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <SectionHeader eyebrow="Rooted in Sunna" title="Built on" highlight="Islamic Principles" subtitle="Every feature is designed around the teachings of marriage in Islam" />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                { icon: BookOpen, title: "Islamic Guidance", desc: "Inspired by the verses on marriage and family." },
                                { icon: HeartHandshake, title: "Wali Involvement", desc: "The guardian is part of the process — by design." },
                                { icon: Lock, title: "Modesty Preserved", desc: "Photos & details revealed only on mutual consent." },
                                { icon: Award, title: "Verified Profiles", desc: "Each profile is reviewed before going live." },
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    className="rounded-2xl p-6 border border-primary/10 bg-secondary/30 hover:bg-secondary/60 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        {React.createElement(item.icon, { className: "h-6 w-6" })}
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing ─── */}



                <section className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            eyebrow="Pricing"
                            title="Simple, Honest"
                            highlight="Plans"
                            subtitle="Choose the plan that fits your needs."
                        />
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {settings.getActivePlans().map((plan, i) => (
                                <motion.div
                                    key={plan.type}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className={`h-full relative ${plan.popular ? "border-primary shadow-2xl shadow-primary/15 -translate-y-1" : "border-primary/10"} transition-all`}>
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                                                Most Popular
                                            </div>
                                        )}
                                        <CardContent className="p-7">
                                            <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1 mb-5">
                                                <span className="text-4xl font-bold text-primary" style={{ letterSpacing: "-0.02em" }}>
                                                    ${plan.priceUSD}
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    / {plan.days} days
                                                </span>
                                            </div>
                                            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                <p className="text-sm font-semibold text-primary">
                                                    {plan.credits} Credits Included
                                                </p>
                                            </div>
                                            <ul className="space-y-2.5 mb-6">
                                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                    {plan.credits} credits to use
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                    Unlimited daily interests
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                    Unlock contact details
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                    Profile boost
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                    Valid for {plan.days} days
                                                </li>
                                                {plan.type === 'platinum' && (
                                                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                        Best value - ${(plan.priceUSD / (plan.days / 30)).toFixed(2)}/month
                                                    </li>
                                                )}
                                            </ul>
                                            <Button
                                                className={`w-full ${plan.popular ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                                                onClick={() => go("/register")}
                                            >
                                                Choose {plan.name}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <SectionHeader eyebrow="Stories" title="Blessed" highlight="Journeys" subtitle="Real families who completed half their deen with us" />
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: "Aisha & Ibrahim", country: "UK → Egypt", text: "Alhamdulillah, the guardian-first approach made our families comfortable from day one. We found each other with dignity." },
                                { name: "Yusuf & Mariam", country: "Canada → Pakistan", text: "The privacy controls gave my family confidence. We took our time and chose with the help of our walis." },
                                { name: "Khalid & Fatima", country: "USA → Morocco", text: "A halal, respectful process. The team supports you at every step, and the matches were thoughtfully suggested." },
                            ].map((t, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                                    <Card className="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all">
                                        <CardContent className="p-7">
                                            <Quote className="h-6 w-6 text-primary/30 mb-3" />
                                            <p className="text-muted-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
                                            <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{t.name[0]}</div>
                                                <div>
                                                    <p className="font-semibold text-foreground text-sm leading-tight">{t.name}</p>
                                                    <p className="text-muted-foreground text-xs">{t.country}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ─── */}
                <section className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <SectionHeader eyebrow="FAQ" title="Common" highlight="Questions" subtitle="Everything families ask before joining" />
                        <div className="space-y-3">
                            {[
                                { q: "Is the platform truly halal?", a: "Yes. Every feature — from blurred photos to guardian involvement — is designed around Islamic marriage principles, supervised by qualified scholars." },
                                { q: "Do I need a guardian (Wali) to register?", a: "Sisters are strongly encouraged to involve their wali. Our 'Link with PIN' feature lets you connect your guardian instantly so they can oversee the process." },
                                { q: "How is my privacy protected?", a: "Photos are blurred by default. Full profile details are only visible after mutual interest and explicit guardian approval." },
                                { q: "Can I cancel my subscription anytime?", a: "Absolutely. There are no lock-ins. Cancel anytime from your account and you keep access until the end of the billing period." },
                                { q: "Which countries do you support?", a: "We serve Muslim families in 50+ countries across the world. Browse globally or filter by region — your choice." },
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                                    <div className="rounded-2xl bg-white border border-primary/10 overflow-hidden">
                                        <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                            className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left">
                                            <span className="font-semibold text-foreground">{item.q}</span>
                                            <ChevronDown className={`h-5 w-5 text-primary shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-primary/10 pt-3">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── App promo banner ─── */}
                <section className="py-20 relative overflow-hidden bg-gradient-to-br from-emerald-900 to-primary text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "32px 32px, 48px 48px" }} />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-amber-200 mb-4">
                                    Mobile App
                                </span>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    Take Marriage Sunna<br /><span className="text-amber-300">wherever you go</span>
                                </h2>
                                <p className="text-white/80 mb-7 leading-relaxed">
                                    Get instant notifications, chat with matches on the move, and approve interests as a guardian from your phone.
                                </p>
                                <AppDownloadRow comingSoon={comingSoon} />
                            </div>
                            <div className="hidden md:flex justify-center">
                                <PhoneMock />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Newsletter ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-2xl text-center">
                        <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Stay in the loop
                        </h2>
                        <p className="text-muted-foreground mb-7">
                            Get marriage advice, success stories, and product updates — once a month, no spam.
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); toast.success("You're subscribed!"); }}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input type="email" required placeholder="Your email"
                                className="flex-1 h-12 px-4 rounded-xl border-2 border-primary/15 focus:border-primary outline-none text-sm bg-white" />
                            <Button type="submit" className="h-12 px-6 bg-primary text-primary-foreground">
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </section>

                {/* ── CTA ─── */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="/pattern-bg.png" alt="" className="w-full h-full object-cover opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-emerald-700/95" />
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">Begin Your Journey Today</h2>
                            <p className="text-white/85 text-lg mb-10 max-w-xl mx-auto">
                                Join thousands of families who have found their perfect match through our halal matchmaking platform.
                            </p>
                            <Button variant="default" size="lg" className="h-14 px-12 text-lg bg-white text-primary hover:bg-white/90 shadow-2xl hover:-translate-y-1 transition-all font-semibold" onClick={() => go("/register")}>
                                Register Now — It's Free<ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* ── Footer ─── */}
                <footer className="bg-secondary/50 border-t pt-14 pb-8">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8 mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={settings.siteLogo || "/logo.png"}
                                        alt={settings.siteName}
                                        className="h-10 w-10 rounded-full"
                                    />
                                    <span className="font-serif font-bold text-lg text-primary leading-tight">
                                        {settings.siteName}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {settings.siteTagline}
                                </p>
                                <div className="flex gap-2 mt-4">
                                    {settings.instagramUrl && (
                                        <a
                                            href={settings.instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                                        >
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    )}
                                    {settings.facebookUrl && (
                                        <a
                                            href={settings.facebookUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                                        >
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    )}
                                    {settings.twitterUrl && (
                                        <a
                                            href={settings.twitterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                                        >
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    )}
                                    {settings.linkedinUrl && (
                                        <a
                                            href={settings.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                    )}
                                    {settings.youtubeUrl && (
                                        <a
                                            href={settings.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
                                        >
                                            <Youtube className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <FooterCol title="Product" links={["Features", "How it Works", "Pricing", "Testimonials"]} />
                            <FooterCol title="Company" links={["About Us", "Blog", "Careers", "Contact"]} />

                            <div>
                                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Contact</h4>
                                <ul className="space-y-2.5 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                        <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary">
                                            {settings.supportEmail}
                                        </a>
                                    </li>
                                    {settings.supportPhone && (
                                        <li className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                            <a href={`tel:${settings.supportPhone}`} className="hover:text-primary">
                                                {settings.supportPhone}
                                            </a>
                                        </li>
                                    )}

                                    {settings.officeAddress && (
                                        <li className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                            {settings.officeAddress}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
                            <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
                            <div className="flex gap-5">
                                {settings.privacyPolicyUrl && (
                                    <a href={settings.privacyPolicyUrl} className="hover:text-primary">Privacy</a>
                                )}
                                {settings.termsOfServiceUrl && (
                                    <a href={settings.termsOfServiceUrl} className="hover:text-primary">Terms</a>
                                )}
                                {settings.cookiePolicyUrl && (
                                    <a href={settings.cookiePolicyUrl} className="hover:text-primary">Cookies</a>
                                )}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

/* ── Sub-components ─── */
function SectionHeader({ eyebrow, title, highlight, subtitle }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-4">{eyebrow}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
                {title} <span className="text-primary">{highlight}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
    );
}

function FooterCol({ title, links }) {
    return (
        <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">{title}</h4>
            <ul className="space-y-2.5 text-sm">
                {links.map((l) => (
                    <li key={l}><a href="#" className="text-muted-foreground hover:text-primary transition">{l}</a></li>
                ))}
            </ul>
        </div>
    );
}

function AppDownloadRow({ comingSoon }) {
    return (
        <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-3">Also Available On</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => comingSoon("App Store")}
                    className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/20 hover:bg-black border border-white/15 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                    <svg viewBox="0 0 384 512" className="h-8 w-8 fill-white shrink-0" aria-hidden="true">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                    </svg>
                    <span className="text-left leading-tight">
                        <span className="block text-[10px] text-white/70">Download on the</span>
                        <span className="block text-lg font-semibold text-white">App Store</span>
                    </span>
                </button>
                <button type="button" onClick={() => comingSoon("Google Play")}
                    className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/20 hover:bg-black border border-white/15 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                    <svg viewBox="0 0 512 512" className="h-8 w-8 shrink-0" aria-hidden="true">
                        <defs>
                            <linearGradient id="gp-blue" x1="105" y1="59" x2="291" y2="246" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#00a0ff" /><stop offset="1" stopColor="#00e2ff" /></linearGradient>
                            <linearGradient id="gp-yellow" x1="380" y1="256" x2="100" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffe000" /><stop offset="1" stopColor="#ffbd00" /></linearGradient>
                            <linearGradient id="gp-red" x1="290" y1="244" x2="120" y2="473" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ff3a44" /><stop offset="1" stopColor="#c31162" /></linearGradient>
                            <linearGradient id="gp-green" x1="100" y1="40" x2="240" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#00a070" /><stop offset="1" stopColor="#00f076" /></linearGradient>
                        </defs>
                        <path fill="url(#gp-blue)" d="M92 17c-6 3-9 10-9 18v442c0 8 3 14 9 17l232-232z" />
                        <path fill="url(#gp-yellow)" d="M398 286l-74-30-66 66 66 66 74-42c21-12 21-48 0-60z" />
                        <path fill="url(#gp-red)" d="M324 256L92 488c7 3 14 1 22-3l284-163z" />
                        <path fill="url(#gp-green)" d="M92 24c-7-3-15-1-22 3l232 229 22-22z" />
                    </svg>
                    <span className="text-left leading-tight">
                        <span className="block text-[10px] text-white/70">GET IT ON</span>
                        <span className="block text-lg font-semibold text-white">Google Play</span>
                    </span>
                </button>
            </div>
        </div>
    );
}

function PhoneMock() {
    return (
        <div className="relative w-[240px] h-[480px] rounded-[40px] bg-black p-2 shadow-2xl rotate-3">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />
            <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-emerald-50 to-amber-50 overflow-hidden relative">
                <div className="absolute inset-0 p-4 pt-10 flex flex-col gap-3">
                    <div className="h-2 w-20 rounded-full bg-emerald-900/15" />
                    <div className="h-7 w-32 rounded-md bg-emerald-900/25" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="aspect-[3/4] rounded-xl bg-white shadow-sm overflow-hidden">
                                <div className="h-2/3 bg-gradient-to-br from-emerald-200 to-amber-200" />
                                <div className="p-1.5">
                                    <div className="h-1.5 w-3/4 bg-emerald-900/30 rounded mb-1" />
                                    <div className="h-1.5 w-1/2 bg-emerald-900/15 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

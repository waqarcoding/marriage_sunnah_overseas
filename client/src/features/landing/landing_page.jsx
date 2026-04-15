
import { Card, CardContent } from "../../components/card";
import * as React from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Globe, Users, CheckCircle, Star } from "lucide-react";
import { Button } from "../../components/button";
import AppBar from "../../components/appbar";

export default function Landing() {
    // Handler for "Learn How It Works" scroll
    const handleLearnHowItWorks = (e) => {
        e.preventDefault();
        const section = document.getElementById("how-it-works");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (

        <div className="min-h-screen flex flex-col">
            <AppBar></AppBar>

            {/* Hero Section with Background Image */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/hero-banner.png"
                        alt="Marriage Sunna Overseas"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/50" />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6 border border-white/20">
                            <Star className="h-4 w-4 text-amber-400" />
                            Halal & Family-Centric Matchmaking
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Find Your Partner <br />
                            <span className="text-emerald-300">with Dignity & Sunnah</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10">
                            Marriage Sunna Overseas connects Muslim families across borders.
                            We prioritize privacy, guardian involvement, and Islamic values
                            to help you complete half your deen.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="/api/login">
                                <Button size="lg" className="h-14 px-10 text-lg bg-white text-emerald-900 hover:bg-white/90 shadow-2xl hover:-translate-y-1 transition-all font-semibold" data-testid="button-start-journey">
                                    Start Your Journey
                                </Button>
                            </a>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                                onClick={() => window.location.href = "/how"}
                            >
                                Learn How It Works
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-primary/5 border-y border-primary/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: "5,000+", label: "Registered Families" },
                            { number: "1,200+", label: "Successful Matches" },
                            { number: "50+", label: "Countries" },
                            { number: "100%", label: "Halal Process" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.number}</div>
                                <div className="text-muted-foreground text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
                            Why Choose <span className="text-primary">Marriage Sunna?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            We follow the principles of Islamic marriage to create a respectful,
                            transparent, and family-oriented matchmaking experience.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Privacy First",
                                desc: "Photos are blurred by default. Full visibility is granted only after mutual interest and family approval.",
                                color: "bg-blue-500/10 text-blue-600"
                            },
                            {
                                icon: Users,
                                title: "Guardian Verified",
                                desc: "We encourage guardian (Wali) involvement from day one to ensure a respectful and serious process.",
                                color: "bg-amber-500/10 text-amber-600"
                            },
                            {
                                icon: Globe,
                                title: "Global Reach",
                                desc: "Connecting compatible families from overseas with shared values and cultural understanding.",
                                color: "bg-emerald-500/10 text-emerald-600"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <Card className="h-full hover:shadow-lg transition-all border-primary/10 hover:border-primary/30">
                                    <CardContent className="p-8">
                                        <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
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

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
                            How It <span className="text-primary">Works</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A simple, dignified process rooted in Islamic principles
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Create Profile", desc: "Register with your guardian details and preferences" },
                            { step: "2", title: "Browse Profiles", desc: "View gender-appropriate matches based on your criteria" },
                            { step: "3", title: "Express Interest", desc: "Send interest requests with guardian approval" },
                            { step: "4", title: "Connect", desc: "Message and arrange meetings after mutual acceptance" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary/20">
                                    {item.step}
                                </div>
                                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/pattern-bg.png"
                        alt=""
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-emerald-700/95" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Heart className="h-12 w-12 text-white/80 mx-auto mb-6" />
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
                            Begin Your Journey Today
                        </h2>
                        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                            Join thousands of families who have found their perfect match
                            through our halal matchmaking platform.
                        </p>
                        <a href="/api/login">
                            <Button size="lg" className="h-14 px-12 text-lg bg-white text-primary hover:bg-white/90 shadow-2xl hover:-translate-y-1 transition-all font-semibold" data-testid="button-cta-register">
                                Register Now - It's Free
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-secondary/50 border-t">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Marriage Sunna Overseas" className="h-10 w-10 rounded-full" />
                            <span className="font-serif font-bold text-xl text-primary">Marriage Sunna Overseas</span>
                        </div>
                        <p className="text-muted-foreground text-sm text-center md:text-right">
                            Connecting hearts with dignity and Islamic values.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

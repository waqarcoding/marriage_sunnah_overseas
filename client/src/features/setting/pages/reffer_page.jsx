import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../auth/services/AuthService";
import SettingService from "../../setting/services/SettingService";
import settings from "../../../context/settings";


const PRIMARY = "#1B4D3E";
const LIGHT_GREEN = "#f0f7f5";
const BORDER = "#e6ece9";

/* ─── Icons ───────────────── */
const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CreditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);

const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const UserIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    </svg>
);

/* ─── Component ───────────────── */
function ReferralPage() {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    // State
    const [referralLink, setReferralLink] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        total_referrals: 0,
        total_commission_earned: "0.00",
        total_credits_generated: "0.00",
        referred_users: []
    });
    const [referrer, setReferrer] = useState(null);

    // ✅ Get dynamic values from settings
    const commissionRate = settings.referralCommissionPercentage;
    const referrerBonus = settings.referralCreditsReferrer;
    const refereeBonus = settings.referralCreditsReferee;

    // Fetch current user and referral data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching user data...');

            const user = await AuthService.getCurrentUser();
            console.log('✅ Current user:', user);
            setCurrentUser(user);

            // Set referral link
            // @ts-ignore
            const baseurl = import.meta.env.VITE_API_URL.replace(/\/api$/, "");
            const link = `${baseurl}/register?id=${user.id}`;

            console.log('🔗 Referral link:', link);
            setReferralLink(link);

            // Fetch my referrals stats
            console.log('🔍 Fetching referrals for user:', user.id);

            SettingService.getMyReferrals(user.id, {
                success: (response) => {
                    console.log('✅ Referrals response:', response);
                    if (response.success && response.data) {
                        console.log('📊 Stats:', response.data);
                        setStats(response.data);
                    } else {
                        console.log('⚠️ No data in response');
                    }
                },
                error: (error) => {
                    console.error('❌ Error fetching referrals:', error);
                }
            });

            // Fetch who referred me
            console.log('🔍 Fetching referrer for user:', user.id);

            SettingService.getMyReferrer(user.id, {
                success: (response) => {
                    console.log('✅ Referrer response:', response);
                    if (response.success && response.data) {
                        console.log('👤 Referrer:', response.data);
                        setReferrer(response.data);
                    } else {
                        console.log('⚠️ No referrer data');
                    }
                },
                error: (error) => {
                    console.log('ℹ️ No referrer found (user not referred):', error);
                }
            });

            setLoading(false);
            console.log('✅ All data fetched');

        } catch (error) {
            console.error('❌ Error in fetchData:', error);
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: settings.siteName,
                text: `Join ${settings.siteName} using my referral link and get ${refereeBonus} credits!`,
                url: referralLink,
            });
        } else {
            handleCopy();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    /* ─── Overview Tab ───────────────── */
    const renderOverview = () => (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginBottom: 20
            }}>
                <StatCard
                    icon={<CreditIcon />}
                    label="Total Earned"
                    value={`${stats.total_commission_earned} Credits`}
                    color="#2f7a65"
                />
                <StatCard
                    icon={<UsersIcon />}
                    label="Total Referrals"
                    value={stats.total_referrals}
                    color="#1B4D3E"
                />
                <StatCard
                    icon={<TrendingUpIcon />}
                    label="Credits Generated"
                    value={`${stats.total_credits_generated}`}
                    color="#4a9d7f"
                />
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 24 }}>Invite & Earn</h2>
                <p style={{ color: "#777", fontSize: 14, marginTop: 6 }}>
                    Share your link and earn {commissionRate}% commission on every credit your friends earn
                </p>
            </div>

            {/* How it Works */}
            <div style={{
                background: "#fff",
                borderRadius: 14,
                padding: 18,
                marginBottom: 20,
                border: `1px solid ${BORDER}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: 16 }}>How it Works</h4>
                {[
                    { step: "Share your referral link", detail: "Copy and send to friends" },
                    { step: "Friend signs up using your link", detail: `They get ${refereeBonus} bonus credits` },
                    { step: "You earn commission", detail: `Get ${commissionRate}% of all credits they earn` }
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                        <div style={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: PRIMARY,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600
                        }}>
                            {i + 1}
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.step}</div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.detail}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rewards */}
            <div style={{
                background: LIGHT_GREEN,
                borderRadius: 14,
                padding: 18,
                marginBottom: 20,
                border: `1px solid ${BORDER}`
            }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Rewards</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 12, color: "#666", margin: 0 }}>You get</p>
                        <h3 style={{ margin: "4px 0 0 0", color: PRIMARY }}>{referrerBonus} Credits</h3>
                        <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0 0" }}>
                            Signup bonus
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Plus</p>
                        <h3 style={{ margin: "4px 0 0 0", color: PRIMARY }}>{commissionRate}% Commission</h3>
                        <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0 0" }}>
                            On their purchases
                        </p>
                    </div>
                </div>
                <div style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${BORDER}`,
                    textAlign: "center"
                }}>
                    <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Your friend gets</p>
                    <h3 style={{ margin: "4px 0 0 0", color: PRIMARY }}>{refereeBonus} Credits</h3>
                    <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0 0" }}>
                        Bonus on signup
                    </p>
                </div>
            </div>

            {/* Referral Link */}
            <div style={{
                background: "#fff",
                borderRadius: 14,
                border: `1px solid ${BORDER}`,
                overflow: "hidden",
                marginBottom: 15,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
                <div style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#555",
                    wordBreak: "break-all",
                    background: "#fafafa"
                }}>
                    {referralLink}
                </div>
                <button onClick={handleCopy} style={{
                    width: "100%",
                    padding: 14,
                    background: copied ? "#2f7a65" : PRIMARY,
                    color: "#fff",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "background 0.2s"
                }}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied!" : "Copy Link"}
                </button>
            </div>

            {/* Share Button */}
            <button onClick={handleShare} style={{
                width: "100%",
                padding: 15,
                borderRadius: 12,
                background: PRIMARY,
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(27, 77, 62, 0.3)",
                transition: "transform 0.2s"
            }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                Share Referral Link
            </button>
        </div>
    );

    /* ─── My Referrals Tab ───────────────── */
    const renderMyReferrals = () => (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20 }}>My Referrals</h3>
                <p style={{ color: "#777", fontSize: 13, marginTop: 4 }}>
                    People who joined using your link
                </p>
            </div>

            {/* Summary Card */}
            <div style={{
                background: PRIMARY,
                color: "#fff",
                borderRadius: 14,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(27, 77, 62, 0.2)"
            }}>
                <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>Total Commission Earned</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total_commission_earned}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Credits</div>
                <div style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13
                }}>
                    <div>
                        <div style={{ opacity: 0.8 }}>Total Referrals</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{stats.total_referrals}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.8 }}>Credits Generated</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{stats.total_credits_generated}</div>
                    </div>
                </div>
            </div>

            {/* Referrals List */}
            {stats.referred_users && stats.referred_users.length > 0 ? (
                <div>
                    {stats.referred_users.map((ref, index) => (
                        <ReferralCard key={index} referral={ref} formatDate={formatDate} />
                    ))}
                </div>
            ) : (
                <EmptyState message="No referrals yet. Start sharing your link!" />
            )}
        </div>
    );

    /* ─── Referred By Tab ───────────────── */
    const renderReferredBy = () => (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20 }}>Referred By</h3>
                <p style={{ color: "#777", fontSize: 13, marginTop: 4 }}>
                    Who invited you to join
                </p>
            </div>

            {referrer ? (
                <div>
                    {/* Referrer Card */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: 20,
                        border: `1px solid ${BORDER}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        marginBottom: 20
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            <div style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background: LIGHT_GREEN,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <UserIcon />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: 18 }}>{referrer.referrer.name}</h4>
                                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#888" }}>
                                    {referrer.referrer.email}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            paddingTop: 16,
                            borderTop: `1px solid ${BORDER}`
                        }}>
                            <InfoItem label="Commission Rate" value={`${referrer.commission_percentage}%`} />
                            <InfoItem label="Your Credits Earned" value={referrer.total_credits_earned} />
                            <InfoItem label="Commission Given" value={referrer.total_commission_given} />
                            <InfoItem label="Joined" value={formatDate(referrer.activated_at)} />
                        </div>
                    </div>

                    {/* Thank You Message */}
                    <div style={{
                        background: LIGHT_GREEN,
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "center",
                        border: `1px solid ${BORDER}`
                    }}>
                        <p style={{ margin: 0, fontSize: 14, color: PRIMARY, fontWeight: 500 }}>
                            🎉 Thanks to {referrer.referrer.name} for inviting you!
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#666" }}>
                            They earn {referrer.commission_percentage}% commission on credits you earn
                        </p>
                    </div>
                </div>
            ) : (
                <EmptyState message="You weren't referred by anyone" />
            )}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f4f7f5" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "16px",
                background: "#fff",
                borderBottom: "1px solid #eee",
                position: "sticky",
                top: 0,
                zIndex: 100
            }}>
                <button onClick={() => navigate(-1)} style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 8,
                    marginLeft: -8
                }}>
                    <ChevronLeft />
                </button>
                <h3 style={{ marginLeft: 8, fontWeight: 600, fontSize: 18 }}>Referral Program</h3>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex",
                background: "#fff",
                borderBottom: `1px solid ${BORDER}`,
                position: "sticky",
                top: 60,
                zIndex: 99
            }}>
                <TabButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    label="Overview"
                />
                <TabButton
                    active={activeTab === "myReferrals"}
                    onClick={() => setActiveTab("myReferrals")}
                    label={`My Referrals (${stats.total_referrals})`}
                />
                <TabButton
                    active={activeTab === "referredBy"}
                    onClick={() => setActiveTab("referredBy")}
                    label="Referred By"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 300
                }}>
                    <div style={{ color: "#888" }}>Loading...</div>
                </div>
            ) : (
                <>
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "myReferrals" && renderMyReferrals()}
                    {activeTab === "referredBy" && renderReferredBy()}
                </>
            )}
        </div>
    );
}

/* ─── Helper Components ───────────────── */

const TabButton = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{
        flex: 1,
        padding: "14px 12px",
        background: "none",
        border: "none",
        borderBottom: active ? `3px solid ${PRIMARY}` : "3px solid transparent",
        color: active ? PRIMARY : "#888",
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.2s"
    }}>
        {label}
    </button>
);

const StatCard = ({ icon, label, value, color }) => (
    <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
        <div style={{ color, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
);

const ReferralCard = ({ referral, formatDate }) => (
    <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: LIGHT_GREEN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>
                <UserIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{referral.name}</h4>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {referral.email}
                </p>
            </div>
        </div>

        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            paddingTop: 12,
            borderTop: `1px solid ${BORDER}`
        }}>
            <InfoItem label="Credits Earned" value={referral.credits_earned} />
            <InfoItem label="Commission" value={referral.commission_earned} />
            <InfoItem label="Rate" value={`${referral.commission_percentage}%`} />
            <InfoItem label="Joined" value={formatDate(referral.joined_at)} />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>{value}</div>
    </div>
);

const EmptyState = ({ message }) => (
    <div style={{
        background: "#fff",
        borderRadius: 14,
        padding: 40,
        textAlign: "center",
        border: `1px solid ${BORDER}`
    }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <p style={{ margin: 0, color: "#888", fontSize: 14 }}>{message}</p>
    </div>
);

export default ReferralPage;
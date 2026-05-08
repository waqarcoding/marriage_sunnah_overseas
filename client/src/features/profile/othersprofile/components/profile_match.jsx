// @ts-nocheck
import { motion } from "motion/react";
import { Heart, Check, Minus } from "lucide-react";
import ImageAvatar from "../../../../ui/image";
import { useEffect, useState } from "react";
import AuthService from "../../../auth/services/AuthService";

function parseArr(v) {
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v || "[]"); } catch { return []; }
}

function fmt(v) {
    if (v == null) return "—";
    if (v === true || v === 1) return "Yes";
    if (v === false || v === 0) return "No";
    return String(v);
}

const FIELD_LABELS = {
    religion: "Religion",
    sect: "Sect",
    nationality: "Nationality",
    country: "Country",
    marital_status: "Marital status",
    has_children: "Has children",
    willing_to_relocate: "Open to relocate"
};

export default function ProfileMatchSection({ profile, myProfile, matchPct, photos, myPhotos, role }) {
    const [loading, setLoading] = useState(false);
    // Holds whether the current user is a Pro subscriber
    const [isPro, setIsPro] = useState(false);


    // ✅ After — use passed myPhotos prop, fallback to parsing myProfile
    const myPhoto = parseArr(myProfile?.images)?.[0] || null;
    console.log("myphoto:" + myPhoto);
    // photos (right side) stays the same — it's already the other person's photos
    const theirPhoto = parseArr(profile?.images)?.[0] || null;
    console.log("their:" + theirPhoto);


    useEffect(() => {
        // Fetch current user's Pro status on mount
        const fetchIsPro = async () => {
            try {
                const res = await AuthService.isPro();
                console.log("explore is pro:" + res)
                setIsPro(res);
            } catch (err) {
                setIsPro(false);
            }
        };
        fetchIsPro();
    }, []);
    if (loading) return (
        <div style={{
            margin: "16px 16px 40px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px"
        }}>
            <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: "2px solid #f0f5f3",
                borderTopColor: "#1B4D3E",
                animation: "spin 0.8s linear infinite"
            }} />
        </div>
    );



    const is_my_blurred = false;

    const theirIsBlurred = profile?.is_blurred_images;



    const myName = myProfile?.name?.split(" ")?.[0] || "You";
    const theirName = (profile.name || "Them").split(" ")?.[0];

    const fields = [
        { key: "religion", mine: myProfile?.religion, theirs: profile.religion },
        { key: "sect", mine: myProfile?.sect, theirs: profile.sect },
        { key: "nationality", mine: myProfile?.nationality, theirs: profile.nationality },
        { key: "country", mine: myProfile?.country, theirs: profile.country },
        { key: "marital_status", mine: myProfile?.marital_status, theirs: profile.marital_status },
        { key: "has_children", mine: myProfile?.has_children, theirs: profile.has_children },
        { key: "willing_to_relocate", mine: myProfile?.willing_to_relocate, theirs: profile.willing_to_relocate },
    ].filter(f => f.theirs != null);

    const matchCount = fields.filter(f => {
        if (f.mine == null) return false;
        return String(f.mine).toLowerCase() === String(f.theirs).toLowerCase() || f.mine == f.theirs;
    }).length;

    return (
        <div style={{
            margin: "16px 16px 40px",
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(27,77,62,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: "0.5px solid rgba(27,77,62,0.06)"
        }}>
            {/* Header */}
            <div style={{
                padding: "20px 20px 18px",
                background: "#1B4D3E",
                position: "relative"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px"
                }}>
                    {/* My side */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1
                    }}>
                        <div style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "18px",
                            overflow: "hidden",
                            border: "2px solid rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.1)"
                        }}>
                            {myPhoto ? (

                                <ImageAvatar
                                    images={myPhoto ? [myPhoto] : []}
                                    alt={myName}
                                    className="w-full h-full object-cover"
                                    isBlurred={is_my_blurred}
                                    shouldShowOverlay={false}
                                    viewerIsPro={isPro}
                                />

                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "22px",
                                    fontWeight: "500",
                                    color: "#ffffff"
                                }}>
                                    {myName[0]}
                                </div>
                            )}
                        </div>
                        <span style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#ffffff",
                            letterSpacing: "0.01em"
                        }}>
                            {myName}
                        </span>
                    </div>

                    {/* Center - Match indicator */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0
                    }}>
                        {matchPct !== null ? (
                            <>
                                <div style={{ position: "relative", width: "68px", height: "68px" }}>
                                    <svg
                                        viewBox="0 0 68 68"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            transform: "rotate(-90deg)"
                                        }}
                                    >
                                        <circle
                                            cx="34"
                                            cy="34"
                                            r="28"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="5"
                                        />
                                        <motion.circle
                                            cx="34"
                                            cy="34"
                                            r="28"
                                            fill="none"
                                            stroke="#ffffff"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 175.9" }}
                                            animate={{ strokeDasharray: `${175.9 * matchPct / 100} 175.9` }}
                                            transition={{ duration: 1.2, ease: [0.34, 0.7, 0.18, 1] }}
                                        />
                                    </svg>
                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column"
                                    }}>
                                        <span style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#ffffff",
                                            letterSpacing: "-0.01em"
                                        }}>
                                            {matchPct}%
                                        </span>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    color: "rgba(255,255,255,0.7)",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase"
                                }}>
                                    Match
                                </span>
                            </>
                        ) : (
                            <div style={{
                                width: "68px",
                                height: "68px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Heart
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        color: "rgba(255,255,255,0.35)",
                                        fill: "rgba(255,255,255,0.12)"
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Their side */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1
                    }}>
                        <div style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "18px",
                            overflow: "hidden",
                            border: "2px solid rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.1)"
                        }}>
                            {theirPhoto ? (
                                <ImageAvatar
                                    images={theirPhoto ? [theirPhoto] : []}
                                    alt={theirName}
                                    className="w-full h-full object-cover"
                                    isBlurred={theirIsBlurred}
                                    shouldShowOverlay={false}
                                    viewerIsPro={isPro}
                                />



                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "22px",
                                    fontWeight: "500",
                                    color: "#ffffff"
                                }}>
                                    {theirName[0]}
                                </div>
                            )}
                        </div>
                        <span style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#ffffff",
                            letterSpacing: "0.01em"
                        }}>
                            {theirName}
                        </span>
                    </div>
                </div>

                {/* Match summary badge */}
                {fields.length > 0 && (
                    <div style={{
                        marginTop: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                    }}>
                        <div style={{
                            padding: "5px 12px",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(8px)"
                        }}>
                            <span style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#ffffff",
                                letterSpacing: "0.01em"
                            }}>
                                {matchCount} of {fields.length} {fields.length === 1 ? "match" : "matches"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison rows */}
            {fields.length > 0 && (
                <div style={{ background: "#ffffff" }}>
                    {fields.map((field, i) => {
                        const matched = field.mine != null && (
                            String(field.mine).toLowerCase() === String(field.theirs).toLowerCase() ||
                            field.mine == field.theirs
                        );

                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    borderBottom: i === fields.length - 1 ? "none" : "0.5px solid rgba(27,77,62,0.06)",
                                    background: matched ? "rgba(16,185,129,0.04)" : "#ffffff",
                                    padding: "14px 16px",
                                    transition: "background 0.15s ease"
                                }}
                            >
                                {/* My value */}
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "3px",
                                    minWidth: 0
                                }}>
                                    <span style={{
                                        fontSize: "10px",
                                        fontWeight: "500",
                                        color: "#9ca3af",
                                        letterSpacing: "0.02em",
                                        textTransform: "uppercase"
                                    }}>
                                        {FIELD_LABELS[field.key] || field.key}
                                    </span>
                                    <span style={{
                                        fontSize: "13px",
                                        fontWeight: matched ? "600" : "500",
                                        color: matched ? "#1B4D3E" : "#374151",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        width: "100%"
                                    }}>
                                        {fmt(field.mine)}
                                    </span>
                                </div>

                                {/* Center indicator */}
                                <div style={{
                                    width: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    {matched ? (
                                        <div style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "6px",
                                            background: "#10b981",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Check style={{ width: "12px", height: "12px", color: "#ffffff", strokeWidth: 3 }} />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "6px",
                                            background: "#f5f5f5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Minus style={{ width: "10px", height: "10px", color: "#d1d5db" }} />
                                        </div>
                                    )}
                                </div>

                                {/* Their value */}
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "3px",
                                    minWidth: 0
                                }}>
                                    <span style={{
                                        fontSize: "10px",
                                        fontWeight: "500",
                                        color: "#9ca3af",
                                        letterSpacing: "0.02em",
                                        textTransform: "uppercase"
                                    }}>
                                        {FIELD_LABELS[field.key] || field.key}
                                    </span>
                                    <span style={{
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        color: "#6b7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        width: "100%",
                                        textAlign: "right"
                                    }}>
                                        {fmt(field.theirs)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
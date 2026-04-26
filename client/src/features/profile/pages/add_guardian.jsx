// @ts-nocheck
// features/profile/pages/AddGuardian.jsx
// WARD's page — ward searches and adds a GUARDIAN (wali) to oversee them

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GuardianService from "../../guardian/services/GuardianService";

const RELATIONSHIPS = [
    { value: "Father", label: "Father", icon: "👨" },
    { value: "Mother", label: "Mother", icon: "👩" },
    { value: "Brother", label: "Brother", icon: "👦" },
    { value: "Sister", label: "Sister", icon: "👧" },
    { value: "Uncle", label: "Uncle", icon: "👴" },
    { value: "Grandfather", label: "Grandfather", icon: "🧓" },
    { value: "Son", label: "Son", icon: "🧒" },
    { value: "Family Friend", label: "Family Friend", icon: "🤝" },
    { value: "Guardian", label: "Other Guardian", icon: "🛡️" },
];

const Avatar = ({ src, name, size = "md" }) => {
    const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-14 h-14 text-base" };
    return src ? (
        <img src={src} alt={name}
            className={`${sizes[size]} rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0`} />
    ) : (
        <div className={`${sizes[size]} rounded-2xl font-bold
            flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}
            style={{ background: "var(--secondary)", color: "var(--primary)" }}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
};

export default function AddGuardian() {
    const navigate = useNavigate();
    const [myGuardians, setMyGuardians] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [relationship, setRelationship] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(null);
    const searchTimer = useRef(null);

    const loadMyGuardians = () => {
        setLoadingList(true);
        GuardianService.getMyGuardian({
            onSuccess: (res) => {
                const data = res?.data;
                if (Array.isArray(data)) setMyGuardians(data);
                else if (data) setMyGuardians([data]);
                else setMyGuardians([]);
                setLoadingList(false);
            },
            onFailed: () => setLoadingList(false),
        });
    };

    useEffect(() => { loadMyGuardians(); }, []);

    useEffect(() => {
        clearTimeout(searchTimer.current);
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        searchTimer.current = setTimeout(() => {
            setSearching(true);
            GuardianService.searchGuardians(searchQuery, {
                onSuccess: (res) => { setSearchResults(res?.data ?? []); setSearching(false); },
                onFailed: () => setSearching(false),
            });
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [searchQuery]);

    const handleSelectUser = (g) => {
        setSelectedUser(g);
        setSearchQuery(g.profile?.name || `User #${g.id}`);
        setSearchResults([]);
    };

    const handleAssign = () => {
        if (!selectedUser) return toast.error("Search and select a guardian first");
        if (!relationship) return toast.error("Please select a relationship");
        if (myGuardians.some(g => g.id === selectedUser.id))
            return toast.error("This person is already your guardian");
        setAssigning(true);
        GuardianService.assignGuardian(
            { guardianUserId: selectedUser.id, relationship },
            {
                onSuccess: () => {
                    toast.success(`${selectedUser.profile?.name || "Guardian"} added as your ${relationship} 🛡️`);
                    setSelectedUser(null); setSearchQuery(""); setRelationship(""); setAssigning(false);
                    loadMyGuardians();
                },
                onFailed: (err) => {
                    toast.error(err?.message || "Failed to assign guardian");
                    setAssigning(false);
                },
            }
        );
    };

    const handleRemove = async (guardianId, name) => {
        setRemoving(guardianId);
        try {
            await GuardianService.removeGuardian({ guardianUserId: guardianId });
            toast.success(`${name} removed as guardian`);
            setMyGuardians(p => p.filter(g => g.id !== guardianId));
        } catch { toast.error("Failed to remove"); }
        finally { setRemoving(null); }
    };

    return (
        <div className="flex flex-col h-full" style={{ background: "var(--secondary)" }}>

            {/* ── Header ── */}
            <div className="border-b px-4 py-4 shadow-sm" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: "var(--primary)" }}>My Guardians (Wali)</h1>
                        <p className="text-xs" style={{ color: "var(--primary)", opacity: 0.5 }}>Add a guardian to oversee your matrimonial process</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full space-y-5">

                {/* Islamic context */}
                <div className="rounded-2xl p-4 border" style={{ background: "var(--accent)", borderColor: "var(--primary)", borderOpacity: 0.2 }}>
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--primary)" }}>🌙 Why a Guardian (Wali)?</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--primary)", opacity: 0.7 }}>
                        Your wali reviews and approves interests on your behalf, ensuring
                        the process follows Islamic principles with trust and care.
                    </p>
                    <p className="text-xs mt-1.5 italic" style={{ color: "var(--primary)", opacity: 0.4 }}>
                        "There is no marriage without a guardian." — Hadith (Abu Dawud)
                    </p>
                </div>

                {/* My Guardians */}
                <div>
                    <h2 className="font-bold text-base mb-3" style={{ color: "var(--primary)" }}>
                        My Guardians
                        {myGuardians.length > 0 && <span className="ml-2 text-sm font-normal" style={{ color: "var(--primary)", opacity: 0.4 }}>({myGuardians.length})</span>}
                    </h2>

                    {loadingList ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ background: "var(--primary-foreground)" }}>
                                    <div className="flex gap-3 items-center">
                                        <div className="w-14 h-14 rounded-2xl" style={{ background: "var(--secondary)" }} />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 rounded w-1/3" style={{ background: "var(--secondary)" }} />
                                            <div className="h-3 rounded w-1/2" style={{ background: "var(--secondary)" }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : myGuardians.length === 0 ? (
                        <div className="rounded-2xl p-4 flex items-center gap-3 border border-yellow-200 bg-yellow-50">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-sm text-yellow-700">No Guardians Assigned</p>
                                <p className="text-xs mt-0.5 text-yellow-600/70">Search below to add your first wali</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myGuardians.map((g) => {
                                const profile = g.profile || {};
                                const rel = RELATIONSHIPS.find(r => r.value === g.relationship);
                                return (
                                    <div key={g.id} className="rounded-2xl border shadow-sm p-4 flex items-center gap-3"
                                        style={{ background: "var(--primary-foreground)", borderColor: "var(--primary)", borderOpacity: 0.15 }}>
                                        <Avatar src={profile.image} name={profile.name} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate" style={{ color: "var(--primary)" }}>
                                                {profile.name || `User #${g.id}`}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                                                {[profile.city, profile.country].filter(Boolean).join(", ")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-sm">{rel?.icon ?? "🛡️"}</span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                                    style={{ color: "var(--primary)", background: "var(--secondary)", borderColor: "var(--primary)", borderOpacity: 0.2 }}>
                                                    {g.relationship || "Guardian"}
                                                </span>
                                                <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Active ✓</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemove(g.id, profile.name)} disabled={removing === g.id}
                                            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 text-red-400 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                                            {removing === g.id
                                                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                                                : "Remove"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add Guardian */}
                <div className="rounded-2xl border shadow-sm p-5" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                    <h2 className="font-bold text-base mb-4" style={{ color: "var(--primary)" }}>Add a Guardian</h2>

                    {/* Search */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                            Step 1 — Search Guardian
                        </label>
                        <div className="relative">
                            <input type="text" placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setSelectedUser(null); }}
                                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition border"
                                style={{ borderColor: "var(--secondary)", background: "var(--primary-foreground)", color: "var(--primary)" }} />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--primary)", opacity: 0.3 }}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: "var(--primary)" }} />}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto border rounded-xl p-2"
                                style={{ borderColor: "var(--secondary)", background: "var(--secondary)" }}>
                                {searchResults.map(g => {
                                    const profile = g.profile || {};
                                    const alreadyAdded = myGuardians.some(m => m.id === g.id);
                                    return (
                                        <button key={g.id} onClick={() => !alreadyAdded && handleSelectUser(g)} disabled={alreadyAdded}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all w-full border
                                                ${alreadyAdded ? "opacity-40 cursor-not-allowed" : ""}`}
                                            style={{
                                                background: selectedUser?.id === g.id ? "var(--accent)" : "var(--primary-foreground)",
                                                borderColor: selectedUser?.id === g.id ? "var(--primary)" : "transparent"
                                            }}>
                                            <Avatar src={profile.image} name={profile.name} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate" style={{ color: "var(--primary)" }}>
                                                    {profile.name || `User #${g.id}`}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: "var(--primary)", opacity: 0.5 }}>
                                                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                            {alreadyAdded
                                                ? <span className="text-xs text-emerald-600 flex-shrink-0">Already added</span>
                                                : selectedUser?.id === g.id ? <span className="text-sm flex-shrink-0" style={{ color: "var(--primary)" }}>✓</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery.trim() && !searching && searchResults.length === 0 && (
                            <p className="text-xs text-center mt-3" style={{ color: "var(--primary)", opacity: 0.4 }}>
                                No guardians found for "{searchQuery}"
                            </p>
                        )}

                        {selectedUser && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border"
                                style={{ background: "var(--accent)", borderColor: "var(--primary)", borderOpacity: 0.2 }}>
                                <Avatar src={selectedUser.profile?.image} name={selectedUser.profile?.name} size="sm" />
                                <p className="text-sm font-medium truncate flex-1" style={{ color: "var(--primary)" }}>
                                    {selectedUser.profile?.name || `User #${selectedUser.id}`}
                                </p>
                                <button onClick={() => { setSelectedUser(null); setSearchQuery(""); }}
                                    className="text-lg leading-none" style={{ color: "var(--primary)", opacity: 0.5 }}>×</button>
                            </div>
                        )}
                    </div>

                    {/* Relationship */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                            Step 2 — Select Relationship
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {RELATIONSHIPS.map(r => (
                                <button key={r.value} onClick={() => setRelationship(r.value)}
                                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all active:scale-95"
                                    style={relationship === r.value
                                        ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                                        : { background: "var(--secondary)", color: "var(--primary)", borderColor: "var(--secondary)" }}>
                                    <span className="text-lg">{r.icon}</span>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedUser && relationship && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                            <span className="text-emerald-500">✓</span>
                            <p className="text-xs text-emerald-700">
                                Adding <strong>{selectedUser.profile?.name}</strong> as your <strong>{relationship}</strong>
                            </p>
                        </div>
                    )}

                    <button onClick={handleAssign} disabled={assigning || !selectedUser || !relationship}
                        className="w-full py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        {assigning && <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary-foreground)" }} />}
                        {assigning ? "Assigning..." : "Add Guardian"}
                    </button>
                </div>
            </div>
            <div className="h-20 md:hidden" />
        </div>
    );
}
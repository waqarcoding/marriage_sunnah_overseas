// @ts-nocheck
// features/guardian/pages/GuardianAddWard.jsx
// GUARDIAN's page — guardian searches and adds a WARD (individual) they manage

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GuardianService from "../services/GuardianService";

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
        <div className={`${sizes[size]} rounded-2xl font-bold flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}
            style={{ background: "var(--secondary)", color: "var(--primary)" }}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
};

export default function GuardianAddWard() {
    const navigate = useNavigate();
    const [myWards, setMyWards] = useState([]);  // wards this guardian manages
    const [loadingList, setLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [relationship, setRelationship] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(null);
    const searchTimer = useRef(null);

    // ── Load my wards ─────────────────────────────────────────────────────────
    const loadMyWards = () => {
        setLoadingList(true);
        GuardianService.getMyGuardian({  // ✅ gets list of wards this guardian manages
            onSuccess: (res) => {
                const data = res?.data;
                if (Array.isArray(data)) setMyWards(data);
                else if (data) setMyWards([data]);
                else setMyWards([]);
                setLoadingList(false);
            },
            onFailed: () => setLoadingList(false),
        });
    };

    useEffect(() => { loadMyWards(); }, []);

    // ── Debounced search for wards ────────────────────────────────────────────
    useEffect(() => {
        clearTimeout(searchTimer.current);
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        searchTimer.current = setTimeout(() => {
            setSearching(true);
            GuardianService.searchGuardians(searchQuery, {  // ✅ search users to add as ward
                onSuccess: (res) => { setSearchResults(res?.data ?? []); setSearching(false); },
                onFailed: () => setSearching(false),
            });
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [searchQuery]);

    const handleSelectUser = (u) => {
        setSelectedUser(u);
        setSearchQuery(u.profile?.name || `User #${u.id}`);
        setSearchResults([]);
    };

    // ── Add ward ──────────────────────────────────────────────────────────────
    const handleAssign = () => {
        if (!selectedUser) return toast.error("Search and select a ward first");
        if (!relationship) return toast.error("Please select your relationship to them");
        if (myWards.some(w => w.id === selectedUser.id))
            return toast.error("This person is already your ward");

        setAssigning(true);
        GuardianService.assignGuardian(  // ✅ assign this guardian to a ward
            { guardianUserId: selectedUser.id, relationship },
            {
                onSuccess: () => {
                    toast.success(`${selectedUser.profile?.name || "Ward"} added as your ward 🤝`);
                    setSelectedUser(null); setSearchQuery(""); setRelationship(""); setAssigning(false);
                    loadMyWards();
                },
                onFailed: (err) => {
                    toast.error(err?.message || "Failed to add ward");
                    setAssigning(false);
                },
            }
        );
    };

    // ── Remove ward ───────────────────────────────────────────────────────────
    const handleRemove = async (wardId, name) => {
        setRemoving(wardId);
        try {
            await GuardianService.removeGuardian({ guardianUserId: wardId }); // ✅
            toast.success(`${name} removed from your wards`);
            setMyWards(p => p.filter(w => w.id !== wardId));
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
                        <h1 className="text-lg font-bold" style={{ color: "var(--primary)" }}>My Wards</h1>
                        <p className="text-xs" style={{ color: "var(--primary)", opacity: 0.5 }}>Manage individuals you are guardianship for</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full space-y-5">

                {/* Guardian role context */}
                <div className="rounded-2xl p-4 border" style={{ background: "var(--accent)", borderColor: "var(--primary)" }}>
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--primary)" }}>🛡️ Your Guardian Role</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--primary)", opacity: 0.7 }}>
                        As a guardian, you review and approve matrimonial interests on behalf of your wards,
                        ensuring the process is handled with care and Islamic principles.
                    </p>
                </div>

                {/* My Wards List */}
                <div>
                    <h2 className="font-bold text-base mb-3" style={{ color: "var(--primary)" }}>
                        My Wards
                        {myWards.length > 0 && <span className="ml-2 text-sm font-normal" style={{ color: "var(--primary)", opacity: 0.4 }}>({myWards.length})</span>}
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
                    ) : myWards.length === 0 ? (
                        <div className="rounded-2xl p-4 flex items-center gap-3 border border-yellow-200 bg-yellow-50">
                            <span className="text-2xl">👤</span>
                            <div>
                                <p className="font-semibold text-sm text-yellow-700">No Wards Added</p>
                                <p className="text-xs mt-0.5 text-yellow-600/70">Search below to add someone you are guardian for</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myWards.map((w) => {
                                const profile = w.profile || {};
                                const rel = RELATIONSHIPS.find(r => r.value === w.relationship);
                                return (
                                    <div key={w.id} className="rounded-2xl border shadow-sm p-4 flex items-center gap-3"
                                        style={{ background: "var(--primary-foreground)", borderColor: "var(--primary)" }}>
                                        <Avatar src={profile.image} name={profile.name} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate" style={{ color: "var(--primary)" }}>
                                                {profile.name || `User #${w.id}`}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                                                {[profile.city, profile.country].filter(Boolean).join(", ")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-sm">{rel?.icon ?? "👤"}</span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                                    style={{ color: "var(--primary)", background: "var(--secondary)", borderColor: "var(--primary)" }}>
                                                    {w.relationship || "Ward"}
                                                </span>
                                                <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                    Active ✓
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemove(w.id, profile.name)} disabled={removing === w.id}
                                            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 text-red-400 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                                            {removing === w.id
                                                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                                                : "Remove"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add Ward */}
                <div className="rounded-2xl border shadow-sm p-5" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                    <h2 className="font-bold text-base mb-4" style={{ color: "var(--primary)" }}>Add a Ward</h2>

                    {/* Search */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                            Step 1 — Search Ward
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
                                {searchResults.map(u => {
                                    const profile = u.profile || {};
                                    const alreadyAdded = myWards.some(w => w.id === u.id);
                                    return (
                                        <button key={u.id} onClick={() => !alreadyAdded && handleSelectUser(u)} disabled={alreadyAdded}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all w-full border
                                                ${alreadyAdded ? "opacity-40 cursor-not-allowed" : ""}`}
                                            style={{
                                                background: selectedUser?.id === u.id ? "var(--accent)" : "var(--primary-foreground)",
                                                borderColor: selectedUser?.id === u.id ? "var(--primary)" : "transparent"
                                            }}>
                                            <Avatar src={profile.image} name={profile.name} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate" style={{ color: "var(--primary)" }}>
                                                    {profile.name || `User #${u.id}`}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: "var(--primary)", opacity: 0.5 }}>
                                                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                            {alreadyAdded
                                                ? <span className="text-xs text-emerald-600 flex-shrink-0">Already added</span>
                                                : selectedUser?.id === u.id ? <span className="text-sm flex-shrink-0" style={{ color: "var(--primary)" }}>✓</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery.trim() && !searching && searchResults.length === 0 && (
                            <p className="text-xs text-center mt-3" style={{ color: "var(--primary)", opacity: 0.4 }}>
                                No users found for "{searchQuery}"
                            </p>
                        )}

                        {selectedUser && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border"
                                style={{ background: "var(--accent)", borderColor: "var(--primary)" }}>
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
                            Step 2 — Your Relationship to Them
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
                                Adding <strong>{selectedUser.profile?.name}</strong> as your ward — you are their <strong>{relationship}</strong>
                            </p>
                        </div>
                    )}

                    <button onClick={handleAssign} disabled={assigning || !selectedUser || !relationship}
                        className="w-full py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        {assigning && <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: "var(--primary-foreground)" }} />}
                        {assigning ? "Adding Ward..." : "Add Ward"}
                    </button>
                </div>
            </div>
            <div className="h-20 md:hidden" />
        </div>
    );
}
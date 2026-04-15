import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import GuardianService from "../api/GuardianService";

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
        <div className={`${sizes[size]} rounded-2xl bg-primary/15 text-primary font-bold
            flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
};

export default function IndividualGuardianPage() {
    const [myGuardians, setMyGuardians] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);   // guardian picked from search
    const [relationship, setRelationship] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(null);   // id being removed
    const searchTimer = useRef(null);

    // ── Load my guardians ──────────────────────────────────────
    const loadMyGuardians = () => {
        setLoadingList(true);
        GuardianService.getMyGuardian({
            onSuccess: (res) => {
                // backend may return array or single object
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

    // ── Debounced search ───────────────────────────────────────
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

    // ── Select a guardian from search ─────────────────────────
    const handleSelectUser = (g) => {
        setSelectedUser(g);
        setSearchQuery(g.profile?.name || `User #${g.id}`);
        setSearchResults([]);
    };

    // ── Assign ─────────────────────────────────────────────────
    const handleAssign = () => {
        if (!selectedUser) return toast.error("Search and select a guardian first");
        if (!relationship) return toast.error("Please select a relationship");

        // Check already added
        const alreadyAdded = myGuardians.some(g => g.id === selectedUser.id);
        if (alreadyAdded) return toast.error("This person is already your guardian");

        setAssigning(true);
        GuardianService.assignGuardian(
            { guardianUserId: selectedUser.id, relationship },
            {
                onSuccess: () => {
                    toast.success(`${selectedUser.profile?.name || "Guardian"} added as your ${relationship} 🛡️`);
                    setSelectedUser(null);
                    setSearchQuery("");
                    setRelationship("");
                    setAssigning(false);
                    loadMyGuardians();
                },
                onFailed: (err) => {
                    toast.error(err?.message || "Failed to assign guardian");
                    setAssigning(false);
                },
            }
        );
    };

    // ── Remove ─────────────────────────────────────────────────
    const handleRemove = (guardianId, name) => {
        if (!window.confirm(`Remove ${name} as your guardian?`)) return;
        setRemoving(guardianId);
        GuardianService.removeGuardian({ guardianUserId: guardianId }, {
            onSuccess: () => {
                toast.success("Guardian removed");
                setMyGuardians(p => p.filter(g => g.id !== guardianId));
                setRemoving(null);
            },
            onFailed: () => { toast.error("Failed to remove"); setRemoving(null); },
        });
    };

    const relationshipObj = RELATIONSHIPS.find(r => r.value === relationship);

    return (
        <div className="flex flex-col h-full bg-gray-50" style={{ fontFamily: "Georgia, serif" }}>

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-5 py-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">My Guardians (Wali)</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Assign one or more guardians to oversee your matrimonial process
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full space-y-5">

                {/* Islamic context */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <p className="text-primary font-semibold text-sm mb-1">🌙 Why a Guardian (Wali)?</p>
                    <p className="text-primary/70 text-xs leading-relaxed">
                        Your wali reviews and approves interests on your behalf, ensuring
                        the process follows Islamic principles with trust and care.
                    </p>
                    <p className="text-primary/40 text-xs mt-1.5 italic">
                        "There is no marriage without a guardian." — Hadith (Abu Dawud)
                    </p>
                </div>

                {/* ── My Guardians List ── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-800 text-base">
                            My Guardians
                            {myGuardians.length > 0 && (
                                <span className="ml-2 text-sm text-gray-400 font-normal">
                                    ({myGuardians.length})
                                </span>
                            )}
                        </h2>
                    </div>

                    {loadingList ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : myGuardians.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-amber-700 font-semibold text-sm">No Guardians Assigned</p>
                                <p className="text-amber-600/70 text-xs mt-0.5">
                                    Search below to add your first wali
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myGuardians.map((g) => {
                                const profile = g.profile || {};
                                const isRemoving = removing === g.id;
                                const rel = RELATIONSHIPS.find(r => r.value === g.relationship);

                                return (
                                    <div key={g.id}
                                        className="bg-white rounded-2xl border border-primary/15
                                            shadow-sm p-4 flex items-center gap-3">
                                        <Avatar src={profile.image} name={profile.name} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">
                                                {profile.name || `User #${g.id}`}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                {[profile.city, profile.country].filter(Boolean).join(", ")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-sm">{rel?.icon ?? "🛡️"}</span>
                                                <span className="text-xs font-medium text-primary bg-primary/8
                                                    border border-primary/20 px-2 py-0.5 rounded-full">
                                                    {g.relationship || "Guardian"}
                                                </span>
                                                <span className="text-xs text-emerald-600 bg-emerald-50
                                                    border border-emerald-100 px-2 py-0.5 rounded-full">
                                                    Active ✓
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(g.id, profile.name)}
                                            disabled={isRemoving}
                                            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium
                                                border border-red-200 text-red-400 hover:bg-red-50
                                                active:scale-95 transition-all disabled:opacity-50">
                                            {isRemoving
                                                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                                                : "Remove"
                                            }
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Add Guardian ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-bold text-gray-900 text-base mb-4">Add a Guardian</h2>

                    {/* Step 1 — Search */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            Step 1 — Search Guardian
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setSelectedUser(null); }}
                                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5
                                    text-sm outline-none focus:ring-2 focus:ring-primary/30
                                    focus:border-primary/50 transition"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searching && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4
                                    border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            )}
                        </div>

                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto
                                border border-gray-100 rounded-xl p-2 bg-gray-50">
                                {searchResults.map(g => {
                                    const profile = g.profile || {};
                                    const alreadyAdded = myGuardians.some(m => m.id === g.id);
                                    return (
                                        <button key={g.id}
                                            onClick={() => !alreadyAdded && handleSelectUser(g)}
                                            disabled={alreadyAdded}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl text-left
                                                transition-all w-full
                                                ${alreadyAdded
                                                    ? "opacity-40 cursor-not-allowed"
                                                    : selectedUser?.id === g.id
                                                        ? "bg-primary/10 border border-primary/30"
                                                        : "hover:bg-white hover:shadow-sm border border-transparent"
                                                }`}>
                                            <Avatar src={profile.image} name={profile.name} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">
                                                    {profile.name || `User #${g.id}`}
                                                </p>
                                                <p className="text-gray-400 text-xs truncate">
                                                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                            {alreadyAdded && (
                                                <span className="text-xs text-emerald-600 flex-shrink-0">Already added</span>
                                            )}
                                            {selectedUser?.id === g.id && !alreadyAdded && (
                                                <span className="text-primary text-sm flex-shrink-0">✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery.trim() && !searching && searchResults.length === 0 && (
                            <p className="text-gray-400 text-xs text-center mt-3">
                                No guardians found for "{searchQuery}"
                            </p>
                        )}

                        {/* Selected guardian pill */}
                        {selectedUser && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary/8
                                border border-primary/20 rounded-xl">
                                <Avatar src={selectedUser.profile?.image} name={selectedUser.profile?.name} size="sm" />
                                <p className="text-sm font-medium text-primary truncate flex-1">
                                    {selectedUser.profile?.name || `User #${selectedUser.id}`}
                                </p>
                                <button onClick={() => { setSelectedUser(null); setSearchQuery(""); }}
                                    className="text-primary/50 hover:text-primary text-lg leading-none">×</button>
                            </div>
                        )}
                    </div>

                    {/* Step 2 — Relationship */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            Step 2 — Select Relationship
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {RELATIONSHIPS.map(r => (
                                <button key={r.value}
                                    onClick={() => setRelationship(r.value)}
                                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border
                                        text-xs font-medium transition-all active:scale-95
                                        ${relationship === r.value
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-gray-50"
                                        }`}>
                                    <span className="text-lg">{r.icon}</span>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {selectedUser && relationship && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                            <span className="text-emerald-500">✓</span>
                            <p className="text-xs text-emerald-700">
                                Adding <strong>{selectedUser.profile?.name}</strong> as your <strong>{relationship}</strong>
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleAssign}
                        disabled={assigning || !selectedUser || !relationship}
                        className="w-full py-3 rounded-xl font-semibold text-sm text-white
                            bg-primary hover:bg-primary/90 active:scale-95 transition-all
                            shadow-sm disabled:opacity-40 flex items-center justify-center gap-2">
                        {assigning && (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        )}
                        {assigning ? "Assigning..." : "Add Guardian"}
                    </button>
                </div>
            </div>

            <div className="h-20 md:hidden" />
        </div>
    );
}
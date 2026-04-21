
import GuardianDashboard from "./guardian_dashboard";
import IndividualGuardianPage from "../../profile/pages/add_guardian";


function getTokenData() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1]));
    } catch { return null; }
}

export default function GuardianPage() {
    const user = getTokenData();

    if (user?.role === "guardian") return <GuardianDashboard user={user} />;
    if (user?.role === "individual") return <IndividualGuardianPage />;

    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8 bg-gray-50">
            <span className="text-5xl">🔒</span>
            <p className="font-bold text-gray-800 text-lg">Access Restricted</p>
            <p className="text-gray-400 text-sm text-center">Please log in to continue.</p>
        </div>
    );
}
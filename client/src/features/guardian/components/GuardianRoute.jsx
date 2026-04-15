// components/GuardianRoute.jsx
import { Navigate } from "react-router-dom";
import { isGuardian } from "../utils/auth";

export default function GuardianRoute({ children }) {
    if (!isGuardian()) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
}
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './store/useAuthStore';

// Access env variable. Vitek exposes env vars on import.meta.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

function App() {
    const { logout, user } = useAuthStore();

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={
                            <div className="p-10">
                                <h1 className="text-2xl font-bold mb-4">Welcome to NoteSphere, {user?.name}!</h1>
                                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                                {/* Workspace/Editor will go here */}
                            </div>
                        } />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;

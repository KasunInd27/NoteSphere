import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import useAuthStore from './store/useAuthStore';
import { ThemeProvider } from './components/providers/ThemeProvider';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

function App() {
    const { logout, user } = useAuthStore();

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={
                                    <div className="h-full flex items-center justify-center flex-col space-y-4">
                                        <h2 className="text-xl font-medium">Welcome to NoteSphere</h2>
                                        <p className="text-muted-foreground">Select a page or create a new one to get started.</p>
                                    </div>
                                } />
                                <Route path="/pages/:id" element={
                                    <div className="p-10">
                                        {/* Editor will go here */}
                                        <h1 className="text-3xl font-bold">Page Content Placeholder</h1>
                                    </div>
                                } />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}

export default App;

import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
    const { loginWithGoogle, isAuthenticated, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleGoogleSuccess = (credentialResponse) => {
        if (credentialResponse.credential) {
            loginWithGoogle(credentialResponse.credential);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">NoteSphere</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your workspace</p>
                </div>
                <div className="mt-8 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;

'use client';
import { useState } from 'react';
import useAuth from '@/hooks/auth/useAuth';
import { useUserStore } from '@/store/userStore';

export default function LoginForm() {
    const { handleLogin } = useAuth();
    const { setUser, user } = useUserStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            email,
            password,
        };

        try {
            const res = await handleLogin(userData);
            if(res) {
                setUser(res);
            }
            console.log("Contenido de userStore: ", user);
            console.log('Login result:', res);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded border border-gray-800 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="email" className="block text-gray-400 mb-2">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-gray-400 mb-2">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full mt-2 py-3 rounded font-medium transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}
'use client';
import { useState } from 'react';
import useAuth from '@/hooks/auth/useAuth';
import { useUserStore } from '@/store/userStore';
import { useBookingStore } from '@/store/bookingStore';

export default function LoginForm({ isInBookingProcess = false }) {
    const { handleLogin } = useAuth();
    const { setUser, user } = useUserStore();
    const { nextStep } = useBookingStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const userData = {
            email,
            password,
        };

        try {

            const res = await handleLogin(userData, !isInBookingProcess);
            
            if(res) {
                setUser(res);
                

                if (isInBookingProcess) {

                    setTimeout(() => {
                        nextStep();
                    }, 300);
                }
            }
           
        } catch (error) {
            console.error('Login error:', error);
            setError('Credenciales incorrectas o error de conexión');
        } finally {
            setLoading(false);
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
                
                {error && (
                    <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md" role="alert">
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full mt-2 py-3 rounded font-medium transition-colors duration-200 ${
                        loading 
                        ? 'bg-gray-700 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </span>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </button>
            </form>
        </div>
    );
}
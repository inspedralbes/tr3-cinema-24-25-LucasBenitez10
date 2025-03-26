'use client';

import { useState } from 'react';
import useAuth from '@/hooks/auth/useAuth';

export default function RegisterForm() {
    const { handleRegister } = useAuth();
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const userData = {
            name,
            lastname,
            email,
            password,
            confirmPassword,
            age: Number(age) 
        };

        try {
            const res = await handleRegister(userData);
            console.log('Registration result:', res);
            setSuccess(true);
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded border border-gray-800 w-full">
            {success ? (
                <div className="bg-green-900 border border-green-700 text-white px-4 py-3 rounded-md mb-4" role="alert">
                    <p className="text-sm">Registro exitoso. Redirigiendo al inicio de sesión...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-400 mb-2">Nombre</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="lastname" className="block text-gray-400 mb-2">Apellidos</label>
                        <input 
                            type="text" 
                            id="lastname"
                            name="lastname" 
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                            required
                        />
                    </div>
                    
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
                    
                    <div>
                        <label htmlFor="confirm-password" className="block text-gray-400 mb-2">Confirmar contraseña</label>
                        <input 
                            type="password" 
                            id="confirm-password"
                            name="confirm-password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="age" className="block text-gray-400 mb-2">Edad</label>
                        <input 
                            type="number" 
                            id="age"
                            name="age" 
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                            required
                            min="0"
                            max="120"
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
                            'Registrarse'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            // Add any post-registration logic (redirect, show success message, etc.)
        } catch (error) {
            console.error('Registration error:', error);
            // Add error handling (show error message to user, etc.)
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded border border-gray-800 w-full">
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
                
                <button 
                    type="submit" 
                    className="w-full mt-2 py-3 rounded font-medium transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
                >
                    Registrarse
                </button>
            </form>
        </div>
    );
}
'use client'; // Important for client-side components in Next.js

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
        e.preventDefault(); // Prevent default form submission
        
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
        <form onSubmit={handleSubmit}>
            <fieldset className='fieldset-form flex items-center flex-col gap-4'>
                <legend>Registro</legend>
                
                <div className="w-full">
                    <label htmlFor="name" className="block mb-2">Nombre</label>
                    <input 
                        type="text" 
                        id="name"
                        name="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="w-full">
                    <label htmlFor="lastname" className="block mb-2">Apellidos</label>
                    <input 
                        type="text" 
                        id="lastname"
                        name="lastname" 
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="w-full">
                    <label htmlFor="email" className="block mb-2">Correo electrónico</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="w-full">
                    <label htmlFor="password" className="block mb-2">Contraseña</label>
                    <input 
                        type="password" 
                        id="password"
                        name="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="w-full">
                    <label htmlFor="confirm-password" className="block mb-2">Confirmar contraseña</label>
                    <input 
                        type="password" 
                        id="confirm-password"
                        name="confirm-password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="w-full">
                    <label htmlFor="age" className="block mb-2">Edad</label>
                    <input 
                        type="number" 
                        id="age"
                        name="age" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                        min="0"
                        max="120"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Registrarse
                </button>
            </fieldset>
        </form>
    );
}
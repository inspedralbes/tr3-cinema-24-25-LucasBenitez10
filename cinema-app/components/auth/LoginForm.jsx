'use client'

import { useState } from 'react';
import useAuth from '@/hooks/auth/useAuth';
import { useUserStore } from '@/store/userStore';


export default function LoginForm() {

    const { handleLogin } = useAuth();
    const {setUser, user} = useUserStore()

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            email,
            password,
        };

        try {
            const res = await handleLogin(userData);
            if(res){
                setUser(res)
            }

            console.log("Contenido de userStore: ", user)

            console.log('Login result:', res);
        } catch (error) {
            console.error('Login error:', error);
        }
    };


    return (

        <form onSubmit={handleSubmit}>
            <fieldset className='fieldset-form flex justify-center items-center flex-col gap-4'>
                <legend>Iniciar Sesión</legend>

                <label htmlFor="email">Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
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
                <button type='submit'>Registrarse</button>
            </fieldset>
        </form>


    )
}

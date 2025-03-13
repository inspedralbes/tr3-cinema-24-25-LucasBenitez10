import * as React from 'react';
import useAuth from '@/hooks/auth/useAuth';

export default function RegisterForm() {
    const { handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        const userData = {
            name: e.target.name.value,
            lastname: e.target.lastname.value,
            email: e.target.email.value,
            password: e.target.password.value,
            confirmPassword: e.target.confirmPassword.value,
            age: e.target.age.value
        }
    }

    return (
        <form action="" >
            <fieldset className='fieldset-form flex items-center flex-col gap-4'>
                <legend>Registro</legend>
                <label htmlFor="name">Nombre</label>
                <input type="text" name="name" />
                <label htmlFor="lastname">Apellidos</label>
                <input type="text" name="lastname" />
                <label htmlFor="email">Correo electrónico</label>
                <input type="text" name="email" />
                <label htmlFor="password">Contraseña</label>
                <input type="password" name="password" />
                <label htmlFor="confirm-password">Confirmar contraseña</label>
                <input type="password" name="confirm-password" />
                <label htmlFor="age">Edad</label>
                <input type="number" name="age" />
                <button>Registrarse</button>
            </fieldset>
        </form>


    )
}



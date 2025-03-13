import * as React from 'react';

export default function LoginForm() {
    return (

        <form action="" >
            <fieldset className='fieldset-form flex justify-center items-center flex-col gap-4'>
                <legend>Iniciar Sesión</legend>
                <label htmlFor="email">Correo electrónico</label>
                <input type="text" name="email" />
                <label htmlFor="password">Contraseña</label>
                <input type="password" name="password" />
                <button>Registrarse</button>
            </fieldset>
        </form>


    )
}

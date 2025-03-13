import * as React from 'react';

export default function RegisterForm() {
    


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
                <button>Registrarse</button>
            </fieldset>
        </form>


    )
}



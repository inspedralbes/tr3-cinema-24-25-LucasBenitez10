import * as React from "react"
import LoginForm from "@/components/auth/LoginForm"

function login() {
    return (
        <div className="min-h-screen bg-black flex justify-center items-center flex-col p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-light text-white mb-2">Bienvenido</h1>
                <p className="text-gray-400">Accede a tu cuenta para continuar</p>
            </div>
            
            {/* Divider with film reel design */}
            <div className="flex items-center w-full max-w-md mb-8">
                <div className="flex-grow h-px bg-gray-800"></div>
                <div className="flex space-x-1 mx-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                    ))}
                </div>
                <div className="flex-grow h-px bg-gray-800"></div>
            </div>
            
            <div className="w-full max-w-md">
                <LoginForm/>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 text-center">
                <p>¿No tienes una cuenta? <a href="/register" className="text-red-500 hover:text-red-400">Regístrate</a></p>
            </div>
        </div>
    )
}

export default login
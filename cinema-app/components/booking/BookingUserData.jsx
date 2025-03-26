import { useState, useEffect } from "react"
import LoginForm from "../auth/LoginForm"
import BookingFormGues from "./BookingFormGues"
import { useBookingStore } from "@/store/bookingStore"
import { useUserStore } from "@/store/userStore"

export default function BookingUserData() {
    const { previousStep, needsConfirmationForPreviousStep, clearSeats, nextStep } = useBookingStore()
    const { user } = useUserStore()
    const [continueGuest, setContinueGuest] = useState(false)
    const [buttonText, setButtonText] = useState("Continuar como invitado")
    const [isLoading, setIsLoading] = useState(true)

    // Verificar si el usuario ya está autenticado
    useEffect(() => {
        // Pequeño timeout para asegurar que el estado del usuario se ha cargado
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500)
        
        return () => clearTimeout(timer)
    }, [user])

    const handleButtonClick = () => {
        setContinueGuest(!continueGuest)

        if (!continueGuest) {
            setButtonText("Iniciar sesión")
        } else {
            setButtonText("Continuar como invitado")
        }
    }

    const handleGoBack = () => {
        // Verificar si se necesita confirmación
        const { needsConfirmation, message } = needsConfirmationForPreviousStep()
        
        if (needsConfirmation) {
            // Mostrar alerta de confirmación
            const confirmed = window.confirm(message)
            
            if (confirmed) {
                previousStep()
                clearSeats()
            }
        } else {
            // No se necesita confirmación, simplemente retroceder
            previousStep()
        }
    }

    // Función para continuar al siguiente paso cuando el usuario ya está logueado
    const handleContinue = () => {
        nextStep()
    }

    // Si está cargando, mostrar un indicador de carga
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white py-12 px-4 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-red-500 border-r-transparent"></div>
                <p className="ml-3">Verificando sesión...</p>
            </div>
        )
    }

    // Si el usuario ya está autenticado, mostrar sus datos
    if (user && user.name) {
        return (
            <div className="min-h-screen bg-black text-white py-12 px-4">
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-light text-center mb-10">Datos de usuario</h2>
                    
                    <button
                        onClick={handleGoBack}
                        className="mb-8 px-4 py-2 bg-transparent border border-gray-700 text-white rounded hover:bg-gray-900 transition-colors"
                    >
                        Atrás
                    </button>
                    
                    {/* Divider with film reel design */}
                    <div className="flex items-center my-8">
                        <div className="flex-grow h-px bg-gray-800"></div>
                        <div className="flex space-x-1 mx-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                            ))}
                        </div>
                        <div className="flex-grow h-px bg-gray-800"></div>
                    </div>
                    
                    <div className="bg-gray-900 p-6 rounded border border-gray-800 mb-8">
                        <h3 className="text-lg font-medium mb-4 text-red-500">Sesión activa</h3>
                        <div className="mb-4">
                            <p className="text-gray-300">Ya tienes una sesión iniciada como:</p>
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                                <p className="text-white font-medium">{user.name} {user.lastname}</p>
                                
                                <p className="text-gray-400 mt-1">{user.email}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 mb-2">
                            <p className="text-gray-400 text-sm">Para continuar con la compra con esta cuenta, haz clic en el botón de abajo.</p>
                        </div>
                    </div>

                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded font-medium transition-colors"
                        onClick={handleContinue}
                    >
                        Continuar con esta cuenta
                    </button>
                </div>
            </div>
        )
    }

    // UI normal si el usuario no está autenticado
    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-light text-center mb-10">Datos de usuario</h2>
                
                <button
                    onClick={handleGoBack}
                    className="mb-8 px-4 py-2 bg-transparent border border-gray-700 text-white rounded hover:bg-gray-900 transition-colors"
                >
                    Atrás
                </button>
                
                {/* Divider with film reel design */}
                <div className="flex items-center my-8">
                    <div className="flex-grow h-px bg-gray-800"></div>
                    <div className="flex space-x-1 mx-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                        ))}
                    </div>
                    <div className="flex-grow h-px bg-gray-800"></div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded border border-gray-800 mb-8">
                    {!continueGuest ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4 text-red-500">Iniciar sesión</h3>
                            <LoginForm isInBookingProcess={true} />
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4 text-red-500">Datos de invitado</h3>
                            <BookingFormGues />
                        </div>
                    )}
                </div>

                <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded font-medium transition-colors"
                    onClick={handleButtonClick}
                >
                    {buttonText}
                </button>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                    {!continueGuest ? 
                        "No tienes una cuenta? Puedes continuar como invitado" : 
                        "¿Ya tienes una cuenta? Inicia sesión para disfrutar de ventajas exclusivas"}
                </div>
            </div>
        </div>
    )
}
import { useState } from "react"
import LoginForm from "../auth/LoginForm"
import BookingFormGues from "./BookingFormGues"
import { useBookingStore } from "@/store/bookingStore"

export default function BookingUserData() {
    const { previousStep, needsConfirmationForPreviousStep, clearSeats} = useBookingStore()
    const [continueGuest, setContinueGuest] = useState(false)
    const [buttonText, setButtonText] = useState("Continuar como invitado")

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
                            <LoginForm />
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
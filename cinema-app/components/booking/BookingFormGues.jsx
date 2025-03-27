import { useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useUserStore } from "@/store/userStore";
 
export default function BookingFormGues() {
    const { setGuestUser, setGuestCheckout } = useUserStore();
    const { nextStep } = useBookingStore();
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: ""
    });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setGuestUser(formData); // Esto ahora establece isGuestCheckout a true a través de nuestro store actualizado
        setGuestCheckout(true); // Explícitamente establecemos para asegurar que está marcado como compra de invitado
        nextStep();
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label 
                        htmlFor="name" 
                        className="block text-sm font-light text-gray-300"
                    >
                        Nombre
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                        className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                </div>
                
                <div className="space-y-2">
                    <label 
                        htmlFor="lastName" 
                        className="block text-sm font-light text-gray-300"
                    >
                        Apellido
                    </label>
                    <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Tu apellido"
                        className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                </div>
                
                <div className="space-y-2">
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-light text-gray-300"
                    >
                        Correo Electrónico
                    </label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="ejemplo@correo.com"
                        className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                </div>
                
                <div className="space-y-2">
                    <label 
                        htmlFor="phone" 
                        className="block text-sm font-light text-gray-300"
                    >
                        Teléfono
                    </label>
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Ej. 600123456"
                        className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                </div>
                
                <div className="pt-2">
                    <button 
                        type="submit" 
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors font-medium"
                    >
                        Continuar
                    </button>
                </div>
            </form>
            
            <div className="mt-4 text-xs text-gray-500 px-2">
                <p>Tus datos solo se utilizarán para procesar tu reserva y enviarte la confirmación de compra.</p>
            </div>
        </div>
    );
}
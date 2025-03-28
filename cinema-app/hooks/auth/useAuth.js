import { authService } from "@/services/authService"
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/store/userStore"

export default function useAuth() {
    const { clearUser } = useUserStore()
    const { login, register, logout } = authService
    const router = useRouter()

    const handleLogin = async (userData, shouldRedirect = true) => {
        const { email, password } = userData
        const response = await login({ email, password })
        if (response) {
            if (shouldRedirect) {
                const { role } = response.user
                if (role === 'admin') {
                    router.push('/administracion')
                } else if (role === 'customer') {
                    router.push('/')
                }
            }
            return response.user
        } else {
            throw new Error(response.message)
        }
    }

    const handleRegister = async (userData) => {
        const { password, confirmPassword } = userData;
        
        if (password !== confirmPassword) {
            throw new Error("Las contraseñas no coinciden");
        }
        
        const response = await register(userData);
        
        if (response) {
            // Redirigir al login después de un registro exitoso
            router.push('/login');
            return response.data;
        } else {
            throw new Error(response.message);
        }
    }

    const handleLogout = async () => {
        try {
            const response = await logout();

            if (response && response.message) {
                router.push('/login');
                clearUser();
                return true;
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }

    const isAuthenticated = async () => {
        const response = await fetch('http://localhost:4000/api/auth/check', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        return response.json()
    }
    return {
        handleLogin,
        handleRegister,
        handleLogout,
        isAuthenticated,
      }
}
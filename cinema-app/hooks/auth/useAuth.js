import { register, login, logout} from "@/services/authService"


export default function useAuth() {

    const handleLogin = async (email, password) => {
        const response = await login({ email, password })
        if (response.ok) {
            return response.data
        } else {
            throw new Error(response.message)
        }
    }

    const handleRegister = async (email, password, confirmPassword) => {
        if (password !== confirmPassword) {
            throw new Error("Las contraseñas no coinciden")
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres")
        }
        const response = await register({ email, password})
        if (response.ok) {
            return response.data
        } else {
            throw new Error(response.message)
        }
    }

    const handleLogout = async () => {
        const response = await logout()
        if (response.ok) {
            return response.data
        } else {
            throw new Error(response.message)
        }
    }

    const isAuthenticated = async () => {
        const response = await fetch('/api/auth/check', {
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
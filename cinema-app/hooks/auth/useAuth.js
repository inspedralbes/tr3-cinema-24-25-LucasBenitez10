import { authService }from "@/services/authService"
// import useUserStore from "@/store/userStore"


export default function useAuth() {
    // const { setUser } = useUserStore()
    const { login, register, logout } = authService

    const handleLogin = async (email, password) => {
        const response = await login({ email, password })
        if (response.ok) {
            return response.data
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
        
        if (response.ok) {
            return response.data;
            
        } else {
            throw new Error(response.message);
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
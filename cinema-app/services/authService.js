const URL = 'http://localhost:4000'
export const authService = {
    
    async register(userData) {
      const response = await fetch(`${URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      console.log("respuesta que recibe authService: ", response)
      return response.json()
    },
    
    async login(userData) {
        const response = await fetch(`${URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        return response.json()
        
    },

    async logout() {
        const response = await fetch(`${URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' 
            
        })
        return response.json()
    }
  }
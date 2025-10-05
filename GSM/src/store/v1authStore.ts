import { create } from 'zustand'
import type { UserRole } from '../types'

export type AuthUser = {
	id: string
	citizen_id: string
	email: string
	first_name: string
	last_name: string
	middle_name?: string
	extension_name?: string
	role: UserRole
	is_active: boolean
}

type AuthState = {
	currentUser: AuthUser | null
	token: string | null
	error: string | null
	isLoading: boolean
	isLoggingOut: boolean
	login: (username: string, password: string) => Promise<boolean>
	register: (userData: any) => Promise<boolean>
	googleLogin: (code: string) => Promise<boolean>
	logout: () => Promise<void>
	clearError: () => void
	initializeAuth: () => Promise<void>
}

const API_BASE_URL = 'http://localhost:8000/api'

// Utility function to construct full name from name components
export const getFullName = (user: AuthUser): string => {
	const parts = [user.first_name]
	
	if (user.middle_name) {
		parts.push(user.middle_name)
	}
	
	parts.push(user.last_name)
	
	if (user.extension_name) {
		parts.push(user.extension_name)
	}
	
	return parts.join(' ')
}


export const useAuthStore = create<AuthState>((set, get) => ({
	currentUser: null,
	token: localStorage.getItem('auth_token'),
	error: null,
	isLoading: true,
	isLoggingOut: false,
	
	initializeAuth: async () => {
		const token = localStorage.getItem('auth_token')
		if (!token) {
			set({ isLoading: false })
			return
		}

		// Validate token with backend
		try {
			const response = await fetch(`${API_BASE_URL}/user`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
				},
			})

			const data = await response.json()

			if (data.success) {
				set({ 
					currentUser: data.data.user, 
					token,
					isLoading: false
				})
			} else {
				localStorage.removeItem('auth_token')
				set({ 
					currentUser: null, 
					token: null, 
					isLoading: false 
				})
			}
		} catch (error) {
			localStorage.removeItem('auth_token')
			set({ 
				currentUser: null, 
				token: null, 
				isLoading: false 
			})
		}
	},

    login: async (username, password) => {
		try {
            // Migrate to GSM-compatible endpoint (email + password)
            const response = await fetch(`${API_BASE_URL}/gsm/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
                body: JSON.stringify({ email: username, password }),
			})

			const data = await response.json()

			if (!response.ok) {
				set({ error: data.message || 'Login failed' })
				return false
			}

			if (data.success) {
                const { user, token } = data.data
				set({ 
                    currentUser: {
                        id: String(user.id),
                        citizen_id: user.citizen_id ?? '',
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: user.role,
                        is_active: user.status === 'active',
                    }, 
					token, 
					error: null 
				})
				localStorage.setItem('auth_token', token)
				return true
			} else {
				set({ error: data.message || 'Login failed' })
				return false
			}
		} catch (error) {
			set({ error: 'Network error. Please try again.' })
			return false
		}
	},

	register: async (userData: any) => {
		set({ isLoading: true, error: null })
		
		try {
			// Debug: Log the data being sent
			console.log('Sending registration data to API:', userData)
			
			const response = await fetch(`${API_BASE_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({
					...userData,
					confirmPassword: userData.confirmPassword
				}),
			})

			const data = await response.json()
			
			// Debug: Log the response
			console.log('Registration API response:', { status: response.status, data })
			
			// Log detailed validation errors if any
			if (response.status === 422 && data.errors) {
				console.log('Validation errors:', data.errors)
			}

			if (!response.ok) {
				// Show specific validation errors if available
				if (response.status === 422 && data.errors) {
					const errorMessages = Object.values(data.errors).flat()
					set({ error: errorMessages.join(', ') })
				} else {
					set({ error: data.message || 'Registration failed' })
				}
				return false
			}

			if (data.success) {
				set({ error: null })
				return true
			} else {
				set({ error: data.message || 'Registration failed' })
				return false
			}
		} catch (error) {
			console.error('Registration error:', error)
			set({ error: 'Network error. Please try again.' })
			return false
		} finally {
			set({ isLoading: false })
		}
	},

	googleLogin: async (code: string) => {
		set({ isLoading: true, error: null })
		
		try {
			console.log('Sending Google OAuth code to API:', code)
			
			const response = await fetch(`${API_BASE_URL}/auth/google`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ code }),
			})

			const data = await response.json()
			console.log('Google OAuth API response:', { status: response.status, data })

			if (!response.ok) {
				set({ error: data.message || 'Google login failed' })
				return false
			}

			if (data.success) {
				const { user, token } = data.data
				set({ 
					currentUser: {
						id: String(user.id),
						citizen_id: user.citizen_id ?? '',
						email: user.email,
						first_name: user.first_name,
						last_name: user.last_name,
						role: user.role,
						is_active: true,
					}, 
					token, 
					error: null 
				})
				localStorage.setItem('auth_token', token)
				return true
			} else {
				set({ error: data.message || 'Google login failed' })
				return false
			}
		} catch (error) {
			console.error('Google OAuth error:', error)
			set({ error: 'Network error. Please try again.' })
			return false
		} finally {
			set({ isLoading: false })
		}
	},

	logout: async () => {
		set({ isLoggingOut: true })
		const { token } = get()
		
		// Call backend logout
		if (token) {
			try {
				await fetch(`${API_BASE_URL}/logout`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Accept': 'application/json',
					},
				})
			} catch (error) {
				// Ignore logout errors
			}
		}

		localStorage.removeItem('auth_token')
		set({ currentUser: null, token: null, error: null, isLoggingOut: false })
	},

	clearError: () => set({ error: null })
}))

// Initialize auth on app start
if (typeof window !== 'undefined') {
	useAuthStore.getState().initializeAuth()
} 
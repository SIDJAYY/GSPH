import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/v1authStore';

export const Login: React.FC = () => {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [submitting, setSubmitting] = useState(false)
	const { login, error, clearError } = useAuthStore()
	const currentUser = useAuthStore(s => s.currentUser)
	const isLoading = useAuthStore(s => s.isLoading)
	const navigate = useNavigate()
	const location = useLocation()

	const fromPath = (location.state as any)?.from?.pathname as string | undefined

	// Redirect if already authenticated
	useEffect(() => {
		if (!isLoading && currentUser) {
			if (currentUser.role === 'admin' || currentUser.role === 'staff') {
				navigate('/admin', { replace: true })
			} else {
				navigate(fromPath || '/', { replace: true })
			}
		}
	}, [currentUser, isLoading, navigate, fromPath])

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	// Don't render login form if already authenticated
	if (currentUser) {
		return null
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		// Clear error when user starts typing
		if (error) {
			clearError()
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true)
		clearError()
		
		const ok = await login(formData.username, formData.password)
		setSubmitting(false)
		
		if (!ok) {
			return
		}
		
		const role = useAuthStore.getState().currentUser?.role
		if (role === 'admin') {
			navigate('/admin', { replace: true })
			return
		}
		if (role === 'staff') {
			navigate('/admin', { replace: true }) // Staff can also access admin panel
			return
		}
		// Fallback: go to previous page or home
		navigate(fromPath || '/', { replace: true })
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<LogIn className="w-12 h-12 text-orange-500 mx-auto mb-4" />
					<h2 className="text-3xl font-bold text-gray-900">
						System Login
					</h2>
				</div>

				{/* Login Form */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
								Username or Email Address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="username"
									name="username"
									type="text"
									required
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
									placeholder="Enter your username or email address"
									value={formData.username}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									name="password"
									type="password"
									required
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
									placeholder="Enter your password"
									value={formData.password}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-600">{error}</p>
						)}

						<Button type="submit" className="w-full" disabled={submitting}>
							<LogIn className="h-4 w-4 mr-2" />
							{submitting ? 'Signing In...' : 'Sign In'}
						</Button>
					</form>
				</div>

				{/* Note */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-blue-800">
						<strong>Note:</strong> This login is for system users only. 
						New scholarship applicants should use the public application form.
					</p>
				</div>

				{/* Back to Home */}
				<div className="text-center">
					<Link to="/">
						<Button variant="outline">
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};
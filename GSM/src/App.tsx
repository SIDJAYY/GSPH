import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { PortalLayout } from './components/layout/PortalLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Portal } from './pages/Portal';
import { RenewalForm } from './pages/renewal/RenewalForm';
import { ScholarshipDashboard } from './pages/scholarshipDashboard/ScholarshipDashboard';
import { NewApplicationForm } from './pages/newApplication/NewApplicationForm';
import { Login } from './pages/auth/Login';
import { GatewayLogin } from './pages/GatewayLogin';
import { useAuthStore } from './store/v1authStore';
import AdminApp from './admin/App';

function PortalLayoutWrapper() {
	return (
		<PortalLayout>
			<Outlet />
		</PortalLayout>
	);
}

function RequireAdmin() {
	const location = useLocation()
	const currentUser = useAuthStore(s => s.currentUser)
	const isLoading = useAuthStore(s => s.isLoading)

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	// Redirect to login if not authenticated or not admin/staff
	if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
		return <Navigate to="/" replace state={{ from: location }} />
	}

	return <AdminApp />
}

function App() {
	return (
		<Router basename={import.meta.env.BASE_URL}>
			<Routes>
				{/* Login page as entry point */}
				<Route path="/" element={<GatewayLogin />} />

				{/* Portal routes - accessible only after login */}
				<Route element={<ProtectedRoute><PortalLayoutWrapper /></ProtectedRoute>}>
					<Route path="/portal" element={<Portal />} />

					<Route path="/new-application" element={<NewApplicationForm />} />
					<Route path="/renewal" element={<RenewalForm />} />
					<Route path="/scholarship-dashboard" element={<ScholarshipDashboard />} />
				</Route>

				{/* Admin login and admin routes */}
				<Route path="/admin-login" element={<Login />} />
				<Route path="/admin/*" element={<RequireAdmin />} />

				{/* 404 */}
				<Route path="*" element={
					<div className="min-h-screen bg-gray-50 flex items-center justify-center">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
							<p className="text-gray-600 mb-8">Page not found</p>
							<a href="/" className="text-orange-500 hover:text-orange-600 font-medium">
								Return to Home
							</a>
						</div>
					</div>
				} />
			</Routes>
		</Router>
	);
}

export default App;
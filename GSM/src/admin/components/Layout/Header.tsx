import { Bell, Menu, LogOut, User } from 'lucide-react'
import React from 'react'
import { useAuthStore, getFullName } from '../../../store/v1authStore'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
	sidebarCollapsed: boolean
	onToggleSidebar: () => void
	breadcrumb?: string[]
}

function Header({ sidebarCollapsed: _sidebarCollapsed, onToggleSidebar, breadcrumb = ['Dashboard'] }: HeaderProps) {
	const [theme, setTheme] = React.useState('')
	const { currentUser, logout, isLoggingOut } = useAuthStore()
	const navigate = useNavigate()

	React.useEffect(() => {
		const storedTheme = localStorage.getItem('theme')
		if (storedTheme) {
			setTheme(storedTheme)
			document.documentElement.classList.toggle('dark', storedTheme === 'dark')
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			setTheme(prefersDark ? 'dark' : 'light')
			document.documentElement.classList.toggle('dark', prefersDark)
		}
	}, [])

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
		localStorage.setItem('theme', newTheme)
		document.documentElement.classList.toggle('dark', newTheme === 'dark')
	}

	const handleLogout = async () => {
		await logout()
		navigate('/')
	}

	return (
		<div className='bg-white/-80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700/50'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<button className='p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors duration-200' onClick={onToggleSidebar}>
						<Menu className='w-6 h-6' />
					</button>
					<div>
						<div className='hidden md:flex items-center space-x-1'>
							<h1 className='text-md font-bold dark:text-white'>EDUCATION & SCHOLARSHIP MANAGEMENT</h1>
						</div>
						<div>
							<span className='text-xs text-slate-500 font-bold'>
								{breadcrumb.join(' > ')}
							</span>
						</div>
					</div>
				</div>
				<div className='flex items-center space-x-2'>
					{/* User Info */}
					<div className='hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400'>
						<User className='w-4 h-4' />
						<span>{currentUser ? getFullName(currentUser) : ''}</span>
						<span className='text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full'>
							{currentUser?.role}
						</span>
					</div>
					
					<button className='relative rounded-xl p-2 text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer'>
						<Bell className='w-6 h-6' />
						<span className='absolute top-0 w-4 h-4 text-white text-xs bg-red-500 rounded-full flex items-center justify-center'>1</span>
					</button>
					
					<button className='ml-2 rounded-xl p-2 bg-slate-300 text-slate-600 hover:bg-slate-400 dark:bg-slate-700 dark:text-yellow-400 dark:hover:bg-slate-900 transition-colors cursor-pointer' onClick={toggleTheme} aria-label='Toggle dark mode'>
						{theme === 'dark' ? (
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
								<path stroke="currentColor" strokeWidth="2" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.46 6.46L5.05 5.05m13.9 0l-1.41 1.41M6.46 17.54l-1.41 1.41"/>
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke="currentColor" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
							</svg>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default Header 
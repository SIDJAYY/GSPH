import React from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import sidebarItems from './sidebarItems'
import { useAuthStore } from '../../../store/v1authStore'

type SidebarProps = {
	collapsed: boolean
	onPageChange?: (id: string) => void
	activeItem: string
}

function Sidebar({ collapsed, onPageChange, activeItem }: SidebarProps) {
	const [expandedItem, setExpandedItem] = React.useState<Set<string>>(new Set([""]))
	const [activeSubItem, setActiveSubItem] = React.useState<string | null>(null)
	const navigate = useNavigate()
	const { logout, isLoggingOut } = useAuthStore()

	const toggleExpanded = (itemid: string) => {
		const newExpanded = new Set(expandedItem)
		if (newExpanded.has(itemid)) {
			// If clicking the same item, just close it
			newExpanded.delete(itemid)
		} else {
			// If clicking a different item, close all others and open this one
			newExpanded.clear()
			newExpanded.add(itemid)
		}
		setExpandedItem(newExpanded)
	}

	const handleLogout = async () => {
		try {
			await logout()
			// Redirect to login page after successful logout
			navigate('/', { replace: true })
		} catch (error) {
			// Even if logout fails, redirect to login page
			navigate('/', { replace: true })
		}
	}

	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
	const shouldCollapse = collapsed && !isMobile

	return (
		<div className="flex">
			<div className={`${shouldCollapse ? 'w-16' : 'w-64'} ${isMobile ? 'w-64' : ''} bg-white border-r border-slate-200/50 flex flex-col transition-all duration-300 ease-in-out dark:bg-slate-900 dark:border-slate-700 h-screen min-h-screen shadow-lg md:shadow-none`}>
				<div className={`${shouldCollapse ? 'p-3' : 'p-6'} flex-shrink-0`}>
					<div className='flex items-center space-x-3'>
						<div className='w-10 h-10 flex items-center justify-center text-white text-xl font-bold flex-shrink-0'>
							            <img src={`${import.meta.env.BASE_URL}Caloocan_City.png`} alt="Caloocan City logo" className="w-full h-full object-contain" />
						</div>
						{!shouldCollapse && (
							<div className="min-w-0">
								<h1 className='text-lg md:text-xl font-bold dark:text-white truncate'>GSM</h1>
								<p className='text-xs text-slate-500 truncate'>Admin Dashboard</p>
							</div>
						)}
					</div>
				</div>
				<hr className='border-slate-200 dark:border-slate-700 mx-2 flex-shrink-0' />
				<nav className='flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto'>
					{sidebarItems.map(item => (
						<div key={item.id}>
							<button
								className={`w-full flex justify-between items-center p-2 md:p-2 rounded-xl transition-all duration-200 text-left ${shouldCollapse ? 'px-2' : 'px-3'} ${(activeItem === item.id || ((item as any).subItems && (item as any).subItems.some((sub: any) => sub.id === activeSubItem))) ? 'bg-orange-200 text-orange-600 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-slate-600 dark:hover:bg-slate-200'}`}
								onClick={() => {
									if ((item as any).subItems) {
										toggleExpanded(item.id)
										if ((item as any).subItems.length > 0) {
											setActiveSubItem((item as any).subItems[0].id)
											if (onPageChange) onPageChange((item as any).subItems[0].id)
										}
									} else {
										setActiveSubItem(null)
										if (onPageChange) onPageChange(item.id)
									}
								}}
							>
								<div className='flex items-center space-x-3 min-w-0'>
									<item.icon className='w-5 h-5 flex-shrink-0' />
									{!shouldCollapse && (
										<span className='text-sm font-medium truncate'>{item.label}</span>
									)}
								</div>
								{!shouldCollapse && (item as any).subItems && (
									<ChevronDown className={`${expandedItem.has(item.id) ? 'rotate-180' : ''} w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0`} />
								)}
							</button>
							{!shouldCollapse && (item as any).subItems && expandedItem.has(item.id) && (
								<div className='ml-6 md:ml-8 mt-2 space-y-1 border-l border-slate-300 pl-2'>
									{(item as any).subItems.map((subitem: any) => (
										<button
											key={subitem.id}
											className={`w-full text-sm text-left p-2 rounded-lg transition-colors duration-200 ${activeSubItem === subitem.id ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-slate-700 dark:text-slate-500 hover:bg-slate-200 dark:hover:text-slate-600 dark:hover:bg-slate-100'}`}
											onClick={() => {
												setActiveSubItem(subitem.id)
												if (onPageChange) onPageChange(subitem.id)
											}}
										>
											<span className="truncate block">{subitem.label}</span>
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</nav>
				
				{/* Logout button at the bottom */}
				<div className="flex-shrink-0 p-2 md:p-4 border-t border-slate-200 dark:border-slate-700">
					<button
						onClick={handleLogout}
						disabled={isLoggingOut}
						className={`w-full flex items-center space-x-3 p-2 md:p-3 rounded-xl transition-all duration-200 text-left ${shouldCollapse ? 'px-2 justify-center' : 'px-3'} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						<LogOut className='w-5 h-5 flex-shrink-0' />
						{!shouldCollapse && (
							<span className='text-sm font-medium'>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default Sidebar 
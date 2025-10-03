import React from 'react'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ContentRenderer from './components/ContentRenderer'
import sidebarItems from './components/Layout/sidebarItems'
import { ToastProvider } from '../components/providers/ToastProvider'

function getBreadcrumb(itemId: string): string[] {
	for (const item of sidebarItems) {
		if (item.id === itemId) return [item.label]
		if ((item as any).subItems) {
			const sub = (item as any).subItems.find((sub: any) => sub.id === itemId)
			if (sub) return [item.label, sub.label]
		}
	}
	return ['Dashboard']
}

function App() {
	const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
	const [activeItem, setActiveItem] = React.useState<string>('dashboard')
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

	const handleSidebarToggle = () => {
		if (window.innerWidth < 768) {
			setMobileMenuOpen(!mobileMenuOpen)
		} else {
			setSidebarCollapsed(!sidebarCollapsed)
		}
	}

	const handlePageChange = (itemId: string) => {
		setActiveItem(itemId)
		if (window.innerWidth < 768) {
			setMobileMenuOpen(false)
		}
	}

	const closeMobileMenu = () => {
		setMobileMenuOpen(false)
	}

	return (
		<ToastProvider>
			<div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 transition-colors duration-200`}>
				<div className='flex h-screen overflow-hidden relative'>
					{mobileMenuOpen && (
						<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobileMenu} />
					)}

					<div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out h-full`}>
						<Sidebar
							collapsed={sidebarCollapsed && window.innerWidth >= 768}
							activeItem={activeItem}
							onPageChange={handlePageChange}
						/>
					</div>

					<div className='flex-1 flex flex-col overflow-hidden w-full md:w-auto'>
						<Header
							sidebarCollapsed={sidebarCollapsed}
							onToggleSidebar={handleSidebarToggle}
							breadcrumb={getBreadcrumb(activeItem)}
						/>
						<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
							<ContentRenderer activeItem={activeItem} onPageChange={handlePageChange} />
						</div>
					</div>
				</div>
			</div>
		</ToastProvider>
	)
}

export default App 
'use client'

import {
	BriefcaseMedical,
	CalendarDays,
	ChartNoAxesCombined,
	FileWarning,
	Headset,
	HelpCircle,
	Home,
	Hospital,
	Layers2,
	LogOut,
	NotebookTabs,
	Settings,
} from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'

import Logo from '@/components/Logo'
import type { LucideIcon } from 'lucide-react'
import Profile from './Profile'
import React from 'react'
import { useMessages } from 'next-intl'

const iconMap: Record<string, LucideIcon> = {
	'/': Home,
	'/online-visit': Headset,
	'/home-visit': BriefcaseMedical,
	'/hospital-visit': Hospital,
	'/second-opinion': Layers2,
	'/activity-journal': NotebookTabs,
	'/specialists-calendar': CalendarDays,
	'/reports': ChartNoAxesCombined,
	'/settings': Settings,
	'/faq': HelpCircle,
	'/log-out': LogOut,
} as const

function MainNav() {
	const pages = useMessages().Pages as unknown as { route: string; name: string }[]
	const currentPath = usePathname()

	const nav = [pages.slice(0, -3), pages.slice(-3, -1), pages.slice(-1)]

	function navItem({ route, name }: { route: string; name: string }) {
		const isSelected = route === '/' ? route === currentPath : currentPath.startsWith(route)

		const IconComponent: LucideIcon = iconMap[route as keyof typeof iconMap]

		return (
			<Link
				className={
					'flex gap-2  hover:text-tcprimary ' +
					(isSelected ? 'text-tcsecondaryDark' : 'text-tctextDark')
				}
				href={route}
			>
				{!IconComponent ? <FileWarning /> : <IconComponent />}
				{name}
			</Link>
		)
	}

	return (
		<div className="justify-between flex flex-col w-96 ">
			<div className="p-6">
				<Profile />
				<nav className="flex flex-col gap-8 pt-4">
					{nav.map((nl) => (
						<div className="main flex flex-col gap-4">{nl.map(navItem)}</div>
					))}
				</nav>
			</div>

			<footer>
				<Logo height={31} />
				<span className="text-tctextGray text-sm">© www.takes-care.com 2024</span>
			</footer>
		</div>
	)
}

export default MainNav


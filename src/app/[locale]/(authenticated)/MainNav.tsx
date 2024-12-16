'use client'

import {
	BriefcaseMedical,
	CalendarDays,
	ChartNoAxesCombined,
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
import Profile from '../Profile'
import React from 'react'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

const navItems = [
	['/', Home],
	['/online-visit', Headset],
	['/home-visit', BriefcaseMedical],
	['/hospital-visit', Hospital],
	['/second-opinion', Layers2],
	['/activity-journal', NotebookTabs],
	['/specialists-calendar', CalendarDays],
	['/reports', ChartNoAxesCombined],
	['/settings', Settings],
	['/faq', HelpCircle],
	['/log-out', LogOut],
] as [string, LucideIcon][]

function MainNav() {
	const currentPath = usePathname()

	const nav = [navItems.slice(0, -3), navItems.slice(-3, -1), navItems.slice(-1)]

	function NavItem([route, Icon]: [route: string, Icon: LucideIcon]) {
		const isSelected = route === '/' ? route === currentPath : currentPath.startsWith(route)

		const t = useTranslations(route)

		return (
			<Link
				key={route}
				className={
					'flex gap-2  hover:text-tcprimary ' +
					(isSelected ? 'text-tcsecondaryDark' : 'text-tctextDark')
				}
				href={route}
			>
				<Icon />
				{t('name')}
			</Link>
		)
	}

	return (
		<div className="flex flex-col justify-between w-96">
			<div className="bg-tccard p-6 rounded-[8px]">
				<Profile />
				<nav className="flex flex-col gap-4">
					{nav.map((nl, i) => (
						<React.Fragment key={i}>
							<Separator />
							<div className="flex flex-col gap-4 main">{nl.map(NavItem)}</div>
						</React.Fragment>
					))}
				</nav>
			</div>

			<footer className="pb-40">
				<Logo height={31} />
				<span className="text-sm text-tctextGray">© www.takes-care.com 2024</span>
			</footer>
		</div>
	)
}

export default MainNav


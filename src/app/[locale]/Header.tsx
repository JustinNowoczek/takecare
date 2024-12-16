'use client'

import { Bug, CalendarPlus2, Globe } from 'lucide-react'
import { Link, routing, usePathname, useRouter } from '@/i18n/routing'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import React from 'react'
import { useParams } from 'next/navigation'

export default function Header() {
	const t = useTranslations('Header')

	const router = useRouter()

	const currentLang = useLocale()
	const availableLangs = routing.locales

	const pathname = usePathname()
	const params = useParams()

	function onSelectChange(nextLocale: string) {
		router.replace(
			// @ts-expect-error documentation specified comment
			{ pathname, params },
			{ locale: nextLocale }
		)
	}

	return (
		<header className="flex justify-between bg-tccard px-16 py-6 border-tcborder border-b-2 border-solid header">
			<Logo />
			<nav className="flex items-center gap-6">
				<Link href="/bug-report">
					<Button variant={'outline'} className="px-6 py-3 border-tcerror h-fit text-tcerror">
						<Bug />
						<span className="text-base">{t('bug-report')}</span>
					</Button>
				</Link>
				<Link href="/home-visit/book">
					<Button className="bg-tcsecondary px-6 py-3 h-fit">
						<CalendarPlus2 />
						<span className="text-base">{t('book-visit')}</span>
					</Button>
				</Link>
				<Select defaultValue={currentLang} onValueChange={onSelectChange}>
					<SelectTrigger className="flex gap-2 border-none text-tcsecondary">
						<Globe />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="text-tcsecondary" defaultValue="polish">
						{availableLangs.map((l, i) => (
							<SelectItem key={i} value={l}>
								{l.toUpperCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</nav>
		</header>
	)
}


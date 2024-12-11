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
import { ChangeEvent } from 'react'
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
			// @ts-expect-error
			{ pathname, params },
			{ locale: nextLocale }
		)
	}

	return (
		<header className="flex justify-between header py-6 px-16 bg-tcbackground border-solid border-tcborder border-b-2">
			<Logo />
			<nav className="flex items-center gap-6">
				<Button variant={'outline'} className="px-6 h-fit text-tcerror py-3 border-tcerror">
					<Bug />
					<span className="text-base">{t('bug-report')}</span>
				</Button>
				<Button className="px-6 h-fit py-3 bg-tcsecondary">
					<CalendarPlus2 />
					<span className="text-base">{t('book-visit')}</span>
				</Button>
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


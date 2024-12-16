'use client'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useLocale, useTranslations } from 'next-intl'

import React from 'react'
import { usePathname } from '@/i18n/routing'

export default function Header() {
	const [, page, subPage] = usePathname().split('/')

	const locale = useLocale()
	const t = useTranslations(`/${page}`)

	return (
		<>
			<Breadcrumb className="pb-2">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href={['', locale, page].join('/')}>{t('name')}</BreadcrumbLink>
					</BreadcrumbItem>

					{subPage && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{t(`/${subPage}.name`)}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="text-[40px] text-tcprimaryDark">{subPage && t(`/${subPage}.name`)}</h1>
		</>
	)
}


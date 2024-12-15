import './globals.css'

import Header from './Header'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

const interVar = localFont({
	src: './fonts/Inter-VariableFont_opsz,wght.ttf',
	variable: '--font-inter',
	weight: '100 900',
})

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	const locale = (await params).locale

	if (!routing.locales.includes(locale as any)) {
		notFound()
	}

	const messages = await getMessages()

	return (
		<html lang={locale}>
			<body className={`${interVar.variable} h-screen flex flex-col antialiased`}>
				<NextIntlClientProvider messages={messages}>
					<Header />
					<div className="flex justify-between gap-5 my-10 px-[100px] h-min">{children}</div>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}


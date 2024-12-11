import './globals.css'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import Header from './Header'
import MainNav from './MainNav'
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
					<div className="flex h-full justify-between gap-5 my-10 px-[100px]">
						<MainNav />

						<main>
							{/* <Breadcrumb className="pb-2">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink href={'/home-visit'}>2</BreadcrumbLink>
									</BreadcrumbItem>
									<>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage>1</BreadcrumbPage>
										</BreadcrumbItem>
									</>
								</BreadcrumbList>
							</Breadcrumb> */}
							<h1 className="text-4xl text-tcprimaryDark pb-6">1</h1>

							{children}
						</main>
						<div className="formNav ">1</div>
					</div>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}


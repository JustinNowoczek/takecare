import Header from './Header'
import MainNav from './MainNav'
import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<MainNav />
			<main className="w-full">
				<Header />
				{children}
			</main>
		</>
	)
}


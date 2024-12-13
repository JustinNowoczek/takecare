import HomeVisitForm from './HomeVisitForm'
import { getLocale } from 'next-intl/server'

const fetchOptions = async () => {
	const locale = await getLocale()

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/homeVisitFetchOptions?language=${locale}`
	)

	if (!response.ok) {
		throw new Error('Failed to fetch options')
	}

	return response.json()
}

export default async function HomeVisitFormPage() {
	let options

	try {
		options = (await fetchOptions()) as {
			[key: string]: { optionName: string; optionLabel: string }[]
		}
	} catch (error) {
		console.log(error)

		return <main>Failed fetching form</main>
	}

	return (
		<main>
			<HomeVisitForm options={options} />
		</main>
	)
}

import HomeVisitForm from './HomeVisitForm'
import fs from 'fs'
import { getLocale } from 'next-intl/server'
import path from 'path'

export default async function HomeVisitFormPage() {
	let options

	try {
		const locale = await getLocale()
		const filePath = path.resolve('public', 'data.json')
		const rawData = fs.readFileSync(filePath, 'utf-8')

		const optionsData = JSON.parse(rawData) as Record<
			string,
			Record<string, { [key: string]: string }>
		>

		options = Object.keys(optionsData).reduce(
			(acc: Record<string, { optionName: string; optionLabel: string }[]>, key) => {
				acc[key] = Object.keys(optionsData[key]).map((optionName) => ({
					optionName,
					optionLabel: optionsData[key][optionName]?.[locale],
				}))

				return acc
			},
			{}
		)
	} catch {
		return <main>Failed fetching form</main>
	}

	return <HomeVisitForm options={options} />
}

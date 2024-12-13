import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type Language = 'en' | 'pl'

interface OptionLabel {
	en: string
	pl: string
}

interface OptionData {
	[key: string]: {
		[optionName: string]: OptionLabel
	}
}

interface TranslatedOption {
	optionName: string
	optionLabel: string
}

const filePath = path.resolve('public', 'data.json')
const rawData = fs.readFileSync(filePath, 'utf-8')
const optionsData: OptionData = JSON.parse(rawData)

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const language: Language = (searchParams.get('language') as Language) || 'pl'

	const translatedData = Object.keys(optionsData).reduce(
		(acc: Record<string, TranslatedOption[]>, key) => {
			acc[key] = Object.keys(optionsData[key]).map((optionName) => ({
				optionName,
				optionLabel: optionsData[key][optionName]?.[language],
			}))
			return acc
		},
		{}
	)

	return NextResponse.json(translatedData)
}


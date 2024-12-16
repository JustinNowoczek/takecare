/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Control, SetFieldValue } from 'react-hook-form'
import React, { useEffect } from 'react'

import FormCalendar from './FormCalendar'
import FormCombo from './FormCombo'
import { FormLabel } from '@/components/ui/form'
import { FormTType } from '../formTType'
import FormTabs from './FormTabs'
import FormText from './FormText'

type Props = {
	control: Control<any>
	formT: FormTType
	options: {
		[key: string]: { optionName: string; optionLabel: string }[]
	}
	i: number
	setValue: SetFieldValue<any>
	firstName: string
}

const RN = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function PatientCard({ control, formT, options, i, setValue, firstName }: Props) {
	const { idType, idVal } = control._getWatch('patients.' + i)

	useEffect(() => {
		if (idType === 'pesel') {
			if (!!/^\d{11}$/.test(idVal)) {
				const year = parseInt(idVal.slice(0, 2), 10)
				const month = parseInt(idVal.slice(2, 4), 10)
				const day = parseInt(idVal.slice(4, 6), 10)

				let fullYear

				if (month >= 1 && month <= 12) {
					fullYear = 1900 + year
				} else if (month >= 21 && month <= 32) {
					fullYear = 2000 + year
				} else if (month >= 41 && month <= 52) {
					fullYear = 2100 + year
				} else if (month >= 61 && month <= 72) {
					fullYear = 2200 + year
				} else if (month >= 81 && month <= 92) {
					fullYear = 1800 + year
				}

				if (fullYear) {
					const adjustedMonth = ((month - 1) % 20) + 1

					setValue(`patients.${i}.birthDate`, new Date(fullYear, adjustedMonth - 1, day))
				}
			}
		}
	}, [idType, idVal, i, setValue])

	return (
		<Card key={i}>
			<CardHeader className="text-2xl">
				<h1 className="text-tcprimaryDark">
					{formT.patientTitle + ' ' + (firstName === '' ? RN[i] : firstName)}
				</h1>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<FormTabs
					{...{
						control,
						...formT.patientFields.ageGroup,
						fieldName: `patients.${i}.ageGroup`,
						optionList: options.ageGroupOptions,
					}}
					control={control}
					fieldName={`patients.${i}.ageGroup`}
				/>

				<div>
					<FormLabel className="font-bold text-tcprimaryDark">{'Dane osobowe'}</FormLabel>
					<div className="flex gap-4">
						<FormText
							{...{
								control,
								...formT.patientFields.firstName,
								fieldName: `patients.${i}.firstName`,
							}}
						/>
						<FormText
							{...{
								control,
								...formT.patientFields.lastName,
								fieldName: `patients.${i}.lastName`,
							}}
						/>
					</div>
				</div>

				<FormCombo
					{...{
						fieldName: `patients.${i}.symptoms`,
						...formT.patientFields.symptoms,
						optionList: options.symptomOptions,
						control,
						searchMismatch: formT.genericMessages.searchMismatch,
						searchPlaceholder: formT.genericMessages.searchPlaceholder,
						selectPlaceholder: formT.genericMessages.selectPlaceholder,
						multiSelect: true,
						setValue,
					}}
				/>

				<FormTabs
					{...{
						control,
						...formT.patientFields.idType,
						fieldName: `patients.${i}.idType`,
						optionList: options.idTypeOptions,
					}}
				/>

				<FormText
					{...{
						control,
						...formT.patientFields.idVal,
						fieldName: `patients.${i}.idVal`,
					}}
				/>

				<FormCalendar
					{...{ control }}
					{...formT.patientFields.birthDate}
					disabled={(date) =>
						date > new Date(new Date().setHours(0, 0, 0, 0)) ||
						date < new Date(new Date().setFullYear(new Date().getFullYear() - 100))
					}
					isDob
					fieldName={`patients.${i}.birthDate`}
				/>
			</CardContent>
		</Card>
	)
}


'use client'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronRight, MinusCircle, PlusCircle } from 'lucide-react'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Path, useForm } from 'react-hook-form'
import React, { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import FormCalendar from './formComponents/FormCalendar'
import FormCheckbox from './formComponents/FormCheckbox'
import FormCombo from './formComponents/FormCombo'
import FormHourSelect from './formComponents/FormHourSelect'
import { FormTType } from './formTType'
import FormText from './formComponents/FormText'
import { Link } from '@/i18n/routing'
import PatientCard from './formComponents/PatientCard'
import { Textarea } from '@/components/ui/textarea'
import { useMessages } from 'next-intl'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

function areSameDay(d1: Date, d2: Date) {
	if (d1 === undefined || d2 === undefined) {
		return false
	}

	return (
		d1.getDay() === d2.getDay() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getFullYear() === d2.getFullYear()
	)
}

const RN = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function HomeVisitForm({
	options,
}: {
	options: {
		[key: string]: { optionName: string; optionLabel: string }[]
	}
}) {
	const formT = useMessages().form as unknown as FormTType

	function requireValidOption(optionList: { optionName: string; optionLabel: string }[]) {
		return [
			(v: string) => optionList.some(({ optionName }) => optionName === v),
			formT.genericMessages.selectMismatch,
		] as [(v: string) => boolean, string]
	}

	const zodRequiredObj = { message: formT.genericMessages.requiredField }

	const addressSchema = z.object({
		country: z.string().refine(...requireValidOption(options.countryOptions)),
		street: z.string().min(1, zodRequiredObj),
		houseNumber: z.coerce.number().min(1, zodRequiredObj),
	})

	const patientSchema = z
		.object({
			ageGroup: z.string().refine(...requireValidOption(options.ageGroupOptions)),
			firstName: z.string().min(1, zodRequiredObj),
			lastName: z.string().min(1, zodRequiredObj),
			symptoms: z
				.array(z.string())
				.refine(
					(symptoms) =>
						symptoms.every((symptom) =>
							options.symptomOptions.find((os) => os.optionName === symptom)
						),
					formT.genericMessages.selectMismatch
				),
			idType: z.string().refine(...requireValidOption(options.idTypeOptions)),
			idVal: z.string().min(1, zodRequiredObj),
			birthDate: z
				.date()
				.min(
					new Date(new Date().setFullYear(new Date().getFullYear() - 100)),
					formT.genericMessages.timeMismatch
				)
				.max(new Date(new Date().setHours(0, 0, 0, 0)), formT.genericMessages.timeMismatch),
		})
		.refine(
			(data) => {
				const { idType, idVal } = data

				if (idType === 'pesel') {
					if (!/^\d{11}$/.test(idVal)) return false

					const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
					const digits = idVal.split('').map(Number) as number[]

					const checksum =
						digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * weights[index], 0) % 10

					return (10 - checksum) % 10 === digits[10]
				}

				if (idType === 'passport') {
					return /^[A-Z]{2}\d{7}$/.test(idType)
				}
			},
			{
				message: formT.genericMessages.inputMismatch,
				path: ['idVal'],
			}
		)
		.refine(
			(data) => {
				const { birthDate, ageGroup } = data

				const today = new Date()

				const eighteenYearsAgo = new Date(
					today.getFullYear() - 18,
					today.getMonth(),
					today.getDate()
				)

				if (ageGroup === 'child') {
					return birthDate > eighteenYearsAgo
				}

				return birthDate <= eighteenYearsAgo
			},
			{
				message: formT.genericMessages.inputMismatch,
				path: ['ageGroup'],
			}
		)

	const visitScheduleSchema = z
		.object({
			visitDate: z
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)), formT.genericMessages.timeMismatch)
				.max(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), formT.genericMessages.timeMismatch),
			provideTimeRange: z.boolean(),
			visitFrom: z.coerce
				.number()
				.min(0, formT.genericMessages.timeMismatch)
				.max(22, formT.genericMessages.timeMismatch)
				.optional(),
			visitTo: z.coerce
				.number()
				.min(0, formT.genericMessages.timeMismatch)
				.max(23, formT.genericMessages.timeMismatch)
				.optional(),
		})
		.refine(
			(data) => {
				if (data.provideTimeRange) {
					return data.visitFrom !== undefined && data.visitTo !== undefined
				}
				return true
			},
			{
				message: formT.genericMessages.requiredField,
				path: ['visitFrom', 'visitTo'],
			}
		)
		.refine(
			(data) => {
				if (data.provideTimeRange) {
					const currentDate = new Date()
					const bookedForToday = areSameDay(data.visitDate, currentDate)

					if (bookedForToday) {
						const minTime =
							currentDate.getMinutes() > 0 ? currentDate.getHours() + 3 : currentDate.getHours() + 2

						return (data.visitFrom as number) >= minTime
					}
				}

				return true
			},
			{ message: formT.genericMessages.timeMismatch, path: ['visitFrom'] }
		)
		.refine(
			(data) =>
				data.provideTimeRange ? (data.visitTo as number) > (data.visitFrom as number) + 1 : true,
			{ message: formT.genericMessages.timeMismatch, path: ['visitTo'] }
		)

	const formSchema = z
		.discriminatedUnion('visitAtSecondary', [
			z.object({
				visitAtSecondary: z.literal(false),
				secondaryAddress: z.unknown(),
			}),
			z.object({
				visitAtSecondary: z.literal(true),
				secondaryAddress: addressSchema,
			}),
		])
		.and(
			z.object({
				requestId: z.string().min(1, zodRequiredObj),
				visitType: z.string().refine(...requireValidOption(options.visitTypeOptions)),
				specialization: z.string().refine(...requireValidOption(options.specializationOptions)),
				topic: z.string().refine(...requireValidOption(options.topicOptions)),
				language: z.string().refine(...requireValidOption(options.languageOptions)),
				additionalInfo: z.string().optional(),
				visitSchedule: visitScheduleSchema,
				homeAddress: addressSchema,
				patients: patientSchema.array().min(1).max(6),
			})
		)
		.refine(
			(data) => {
				if (data.visitAtSecondary) {
					return data.secondaryAddress !== undefined
				}

				return true
			},
			{
				message: formT.genericMessages.requiredField,
				path: ['secondaryAddress'],
			}
		)
		.transform((data) => {
			if (!data.visitAtSecondary) {
				return { ...data, secondaryAddress: undefined }
			}
			return data
		})

	const blankPatient = {
		ageGroup: options.ageGroupOptions[0].optionName,
		firstName: '',
		idType: options.idTypeOptions[0].optionName,
		idVal: '',
		lastName: '',
		symptoms: [],
		birthDate: new Date(),
	}

	const blankAddress = {
		country: '',
		street: '',
		houseNumber: '' as unknown as number,
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			requestId: '',
			visitType: options.visitTypeOptions[0].optionName,
			specialization: '',
			topic: '',
			visitSchedule: {
				provideTimeRange: false,
				visitDate: new Date(new Date().setHours(0, 0, 0, 0)),
			},
			language: '',
			additionalInfo: '',
			homeAddress: { ...blankAddress },
			visitAtSecondary: false,
			secondaryAddress: { ...blankAddress } as unknown as undefined,
			patients: [{ ...blankPatient }],
		},
	})

	const { watch, getValues, control, setValue, handleSubmit } = form

	const bookedDate = watch('visitSchedule.visitDate')
	const bookedDateStart = watch('visitSchedule.visitFrom')
	const wantsProvidedTime = watch('visitSchedule.provideTimeRange')

	const timeRanges: null | [[number, number], [number, number]] = useMemo(() => {
		if (wantsProvidedTime) {
			const bookedForToday = areSameDay(bookedDate, new Date())

			const currentDate = new Date()

			const res = [
				[
					!bookedForToday
						? 0
						: currentDate.getMinutes() > 0
						? currentDate.getHours() + 3
						: currentDate.getHours() + 2,
					22,
				],
			]

			res[1] = [(bookedDateStart ? +bookedDateStart : res[0][0]) + 1, 23]

			return res as [[number, number], [number, number]]
		}

		return null
	}, [wantsProvidedTime, bookedDate, bookedDateStart])

	const allPatients = watch('patients')

	function removePatient() {
		if (getValues('patients').length > 1) {
			const currentPatients = getValues('patients')
			currentPatients.pop()

			setValue('patients', currentPatients)
		}
	}

	function addPatient() {
		if (getValues('patients').length < 6) {
			const currentPatients = getValues('patients')

			setValue('patients', [...currentPatients, { ...blankPatient }])
		}
	}

	function onSubmit(values: z.infer<typeof formSchema>) {
		alert(JSON.stringify(values, null, 2))

		form.reset()
	}

	function getCombo(
		params: {
			fieldName: Path<z.infer<typeof formSchema>>
			fieldLabel: string
			optionList: { optionName: string; optionLabel: string }[]
		},
		multiSelect: boolean = false
	) {
		return (
			<FormCombo<z.infer<typeof formSchema>>
				{...{ control, setValue, multiSelect }}
				{...params}
				{...formT.genericMessages}
			/>
		)
	}

	return (
		<main className="relative flex gap-5">
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-6">
					<Card>
						<CardHeader className="text-2xl text-tcprimaryDark">{formT.title}</CardHeader>
						<CardContent className="flex flex-col gap-6">
							<FormText {...{ control }} {...formT.fields.requestId} fieldName="requestId" />

							{getCombo({
								fieldLabel: formT.fields.visitType.fieldLabel,
								fieldName: 'visitType',
								optionList: options.visitTypeOptions,
							})}

							{getCombo({
								fieldLabel: formT.fields.visitType.fieldLabel,
								fieldName: 'specialization',
								optionList: options.specializationOptions,
							})}

							<FormCalendar
								{...{ control }}
								{...formT.fields.visitSchedule.visitDate}
								disabled={(date) =>
									date < new Date(new Date().setHours(0, 0, 0, 0)) ||
									date > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
								}
								fieldName="visitSchedule.visitDate"
							/>

							<div>
								<FormCheckbox
									{...{
										control,
										...formT.fields.visitSchedule.provideTimeRange,
										fieldName: 'visitSchedule.provideTimeRange',
									}}
								/>
							</div>

							{timeRanges && (
								<div>
									<FormLabel className="font-bold text-tcprimaryDark">Godzina</FormLabel>
									<div className="flex gap-2">
										<FormHourSelect
											{...{
												control,
												fieldName: 'visitSchedule.visitFrom',
												timeRange: timeRanges[0],
												...formT.fields.visitSchedule.visitFrom,
											}}
										/>

										<FormHourSelect
											{...{
												control,
												fieldName: 'visitSchedule.visitTo',
												timeRange: timeRanges[1],
												...formT.fields.visitSchedule.visitTo,
											}}
										/>
									</div>
								</div>
							)}

							{getCombo({
								fieldName: 'topic',
								...formT.fields.topic,
								optionList: options.topicOptions,
							})}

							<FormField
								control={control}
								name="additionalInfo"
								render={({ field }) => (
									<FormItem id={'additionalInfo'}>
										<FormLabel className="font-bold text-tcprimaryDark">
											{formT.fields.additionalInfo.fieldLabel}
										</FormLabel>
										<FormControl>
											<Textarea
												className="min-h-40"
												placeholder={formT.fields.additionalInfo.fieldPlaceholder}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{getCombo({
								fieldName: 'language',
								...formT.fields.language,
								optionList: options.languageOptions,
							})}

							<div>
								{getCombo({
									fieldName: 'homeAddress.country',
									...formT.fields.address.country,
									optionList: options.countryOptions,
								})}

								<div className="flex gap-4 pt-2">
									<FormText
										{...{ control, ...formT.fields.address.street }}
										fieldName={'homeAddress.street'}
									/>
									<FormText
										{...{ control, ...formT.fields.address.houseNumber }}
										fieldName={'homeAddress.houseNumber'}
									/>
								</div>
							</div>

							<FormCheckbox
								{...{
									control,
									...formT.fields.visitAtSecondary,
									fieldName: 'visitAtSecondary',
								}}
							/>

							{watch('visitAtSecondary') && (
								<div>
									{getCombo({
										fieldName: 'secondaryAddress.country',
										...formT.fields.address.country,
										optionList: options.countryOptions,
									})}
									<div className="flex gap-4 pt-2">
										<FormText
											{...{ control, ...formT.fields.address.street }}
											fieldName={'secondaryAddress.street'}
										/>
										<FormText
											{...{ control, ...formT.fields.address.houseNumber }}
											fieldName={'secondaryAddress.houseNumber'}
										/>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{allPatients.map(({ firstName }, i) => {
						return <PatientCard {...{ control, firstName, formT, i, options, setValue }} key={i} />
					})}

					<div className="flex gap-4">
						<Button
							type="button"
							onClick={addPatient}
							disabled={allPatients.length > 5}
							className="bg-tcsecondary w-full"
						>
							{formT.genericMessages.addPatient} <PlusCircle />
						</Button>

						<Button
							type="button"
							onClick={removePatient}
							disabled={allPatients.length < 2}
							className="w-full"
							variant="destructive"
						>
							{formT.genericMessages.removePatient} <MinusCircle />
						</Button>
					</div>

					<Button type="submit" className="mb-40 w-full" variant="outline">
						{formT.genericMessages.submit} <ChevronRight />
					</Button>
				</form>
			</Form>
			<Card className="relative -top-20 w-[200px] h-min formNav">
				<CardContent>
					<Accordion type="multiple" defaultValue={['main']}>
						<AccordionItem value="main">
							<AccordionTrigger disabled className="text-tcprimaryDark">
								{formT.title}
							</AccordionTrigger>
							<AccordionContent className="flex flex-col gap-2 w-max">
								<Link href={'#requestId'}>{formT.fields.requestId.fieldLabel}</Link>
								<Link href={'#visitType'}>{formT.fields.visitType.fieldLabel}</Link>
								<Link href={'#specialization'}>{formT.fields.specialization.fieldLabel}</Link>
								<Link href={'#visitSchedule.visitDate'}>
									{formT.fields.visitSchedule.visitDate.fieldLabel}
								</Link>
								<Link href={'#topic'}>{formT.fields.topic.fieldLabel}</Link>
								<Link href={'#additionalInfo'}>{formT.fields.additionalInfo.fieldLabel}</Link>
								<Link href={'#language'}>{formT.fields.language.fieldLabel}</Link>
								<Link href={'#homeAddress.country'}>{formT.fields.address.country.fieldLabel}</Link>
							</AccordionContent>
						</AccordionItem>
						{allPatients.map(({ firstName }, i) => (
							<AccordionItem key={i} value={'patient' + i}>
								<AccordionTrigger className="text-tcprimaryDark">
									{formT.patientTitle + ' ' + (firstName === '' ? RN[i] : firstName)}
								</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-2 w-max">
									<Link href={'#patients.' + i + '.ageGroup'}>
										{formT.patientFields.ageGroup.fieldLabel}
									</Link>
									<Link href={'#patients.' + i + '.symptoms'}>
										{formT.patientFields.symptoms.fieldLabel}
									</Link>
									<Link href={'#patients.' + i + '.idType'}>
										{formT.patientFields.idType.fieldLabel}
									</Link>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</CardContent>
			</Card>
		</main>
	)
}


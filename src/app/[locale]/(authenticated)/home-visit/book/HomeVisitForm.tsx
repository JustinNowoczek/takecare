'use client'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useEffect, useMemo, useState } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown } from 'lucide-react'
import FormCheckbox from './FormCheckbox'
import FormCombo from './FormCombo'
import FormText from './FormText'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { useLocale } from 'next-intl'
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

const generateRange = ([start, end]: [start: number, end: number]) =>
	Array.from({ length: end - start + 1 }, (_, i) => String(start + i))

const genericMsgs = {
	selectPlaceholder: 'Wybierz opcje...',
	selectMismatch: 'Opcja nie jest na liscie.',
	searchPlaceholder: 'Wyszukaj opcje...',
	searchMismatch: 'Brak opcji pod tym wyszukaniem',

	timeMismatch: 'Ten czas nie jest dostepny',
	requiredField: 'Pole jest wymagane',
	minLength: 'Input must be at least {min} characters long.',
}

function requireValidOption(optionList: { optionName: string; optionLabel: string }[]) {
	return [
		(v: string) => optionList.some(({ optionName }) => optionName === v),
		genericMsgs.selectMismatch,
	] as [(v: string) => boolean, string]
}

const zodRequiredObj = { message: genericMsgs.requiredField }

export default function HomeVisitForm({
	options,
}: {
	options: {
		[key: string]: { optionName: string; optionLabel: string }[]
	}
}) {
	const addressSchema = z.object({
		country: z.string().refine(...requireValidOption(options.countryOptions)),
		street: z.string().min(1, zodRequiredObj),
		houseNumber: z.coerce.number().min(1, zodRequiredObj),
	})

	const patientSchema = z.object({
		ageGroup: z.string().refine(...requireValidOption(options.ageGroupOptions)),
		firstName: z.string().min(1, zodRequiredObj),
		lastName: z.string().min(1, zodRequiredObj),
		symptoms: z
			.array(z.string())
			.refine(
				(symptoms) => symptoms.every((symptom) => options.symptomOptions.includes(symptom)),
				genericMsgs.selectMismatch
			),
		idType: z.string().refine(...requireValidOption(options.idTypeOptions)),
		idVal: z.string().min(1, zodRequiredObj),
	})

	const visitScheduleSchema = z
		.object({
			visitDate: z
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)), genericMsgs.timeMismatch)
				.max(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), genericMsgs.timeMismatch),
			provideTimeRange: z.boolean(),
			visitFrom: z.coerce
				.number()
				.min(0, genericMsgs.timeMismatch)
				.max(22, genericMsgs.timeMismatch)
				.optional(),
			visitTo: z.coerce
				.number()
				.min(0, genericMsgs.timeMismatch)
				.max(23, genericMsgs.timeMismatch)
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
				message: genericMsgs.requiredField,
				path: ['visitFrom', 'visitTo'],
			}
		)
		.refine(
			(data) => {
				if (data.provideTimeRange) {
					const currentDate = new Date()
					const bookedForToday = areSameDay(data.visitDate, currentDate)
					data.visitDate.toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10)

					if (bookedForToday) {
						const minTime =
							currentDate.getMinutes() > 0 ? currentDate.getHours() + 3 : currentDate.getHours() + 2

						return (data.visitFrom as number) >= minTime
					}
				}

				return true
			},
			{ message: genericMsgs.timeMismatch, path: ['visitFrom'] }
		)
		.refine(
			(data) =>
				data.provideTimeRange ? (data.visitTo as number) > (data.visitFrom as number) + 1 : true,
			{ message: genericMsgs.timeMismatch, path: ['visitTo'] }
		)

	const formSchema = z
		.object({
			requestId: z.string().min(1, zodRequiredObj),
			visitType: z.string().refine(...requireValidOption(options.visitTypeOptions)),
			specialization: z.string().refine(...requireValidOption(options.specOptions)),
			topic: z.string().refine(...requireValidOption(options.topicOptions)),
			language: z.string().refine(...requireValidOption(options.languageOptions)),
			additionalInfo: z.string().optional(),
			visitSchedule: visitScheduleSchema,
			homeAddress: addressSchema,
			visitAtSecondary: z.boolean(),
			secondaryAddress: z.optional(addressSchema),
			patients: patientSchema.array().min(1).max(6),
		})
		.refine(
			(data) => {
				if (data.visitAtSecondary) {
					return data.secondaryAddress !== undefined
				}
				return true
			},
			{
				message: genericMsgs.requiredField,
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
		ageGroup: options.ageGroupOptions[0],
		firstName: '',
		idType: '',
		idVal: '',
		lastName: '',
		symptoms: [],
	}

	const blankAddress = {
		country: '',
		street: '',
		houseNr: '',
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			requestId: '',
			visitType: options.visitTypeOptions[0],
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
			secondaryAddress: { ...blankAddress },
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

			res[1] = [(bookedDateStart ? bookedDateStart : res[0][0]) + 1, 23]

			return res as [[number, number], [number, number]]
		}

		return null
	}, [wantsProvidedTime, bookedDate, bookedDateStart])

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
	}

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

	const t = {
		requestId: { fieldLabel: 'Numer zgłoszenia', fieldPlaceholder: 'Wpisz numer zgłoszenia' },
	}

	function getCombo(
		params: {
			fieldName: keyof z.infer<typeof formSchema>
			fieldLabel: string
			optionList: { optionName: string; optionLabel: string }[]
		},
		multiSelect: boolean = false
	) {
		return (
			<FormCombo<z.infer<typeof formSchema>>
				{...{ control, setValue, multiSelect }}
				{...params}
				{...genericMsgs}
			/>
		)
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8">
					<FormText control={control} fieldName="requestId" {...t.requestId} />

					{getCombo({
						fieldLabel: 'Rodzaj wizyty',
						fieldName: 'visitType',
						optionList: options.visitTypeOptions,
					})}

					{getCombo({
						fieldLabel: 'Specjalizacja',
						fieldName: 'specialization',
						optionList: options.specializationOptions,
					})}

					<FormField
						control={control}
						name="visitSchedule.visitDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Data wizyty</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={'outline'}
												className={
													' pl-3 text-left font-normal ' +
													(!field.value ? 'text-muted-foreground' : '')
												}
											>
												{field.value ? format(field.value, 'PPP') : <span>Wybierz date</span>}
												<ChevronDown className="opacity-50 ml-auto w-4 h-4" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="p-0 w-auto" align="start">
										<Calendar
											weekStartsOn={1}
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date < new Date(new Date().setHours(0, 0, 0, 0)) ||
												date > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="visitSchedule.provideTimeRange"
						render={({ field }) => (
							<FormItem className="flex items-center">
								<FormControl>
									<Checkbox
										className="mt-2 mr-3"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>Wybierz konkretny przedział godzinowy</FormLabel>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormCheckbox {...{ control, fieldLabel }} />

					<div>
						<FormLabel>Godzina</FormLabel>
						<div className="flex">
							<FormField
								control={control}
								name="visitSchedule.visitFrom"
								render={({ field }) => (
									<FormItem className="w-full">
										<Select disabled={!wantsProvidedTime} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={'Od'} />
												</SelectTrigger>
											</FormControl>
											{timeRanges && (
												<SelectContent>
													{generateRange(timeRanges[0]).map((n) => (
														<SelectItem key={n} value={n}>
															{n + ':00'}
														</SelectItem>
													))}
												</SelectContent>
											)}
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="visitSchedule.visitTo"
								render={({ field }) => (
									<FormItem className="w-full">
										<Select disabled={!wantsProvidedTime} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={'Do'} />
												</SelectTrigger>
											</FormControl>
											{timeRanges && (
												<SelectContent>
													{generateRange(timeRanges[1]).map((n) => (
														<SelectItem key={n} value={n}>
															{n + ':00'}
														</SelectItem>
													))}
												</SelectContent>
											)}
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{getCombo({
						fieldLabel: 'Temat',
						fieldName: 'topic',
						optionList: options.topicOptions,
					})}

					<FormField
						control={control}
						name="additionalInfo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Dodatkowe informacje (opcjonalnie)</FormLabel>
								<FormControl>
									<Textarea placeholder="Opisz problem " {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{getCombo({
						fieldLabel: 'Jezyk',
						fieldName: 'language',
						optionList: options.languageOptions,
					})}

					<div>
						{getCombo({
							fieldLabel: 'Dane addressowe',
							fieldName: 'homeAddress.country',
							optionList: options.countryOptions,
						})}
						<div className="flex gap-4 pt-2">
							<FormField
								control={control}
								name="homeAddress.street"
								render={({ field }) => (
									<FormItem className="flex-[2]">
										<FormControl>
											<Input placeholder="Ulica" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="homeAddress.houseNumber"
								render={({ field }) => (
									<FormItem className="flex-[1]">
										<FormControl>
											<Input placeholder="Nr lokalu" type="number" min={1} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<FormField
						control={control}
						name="visitAtSecondary"
						render={({ field }) => (
							<FormItem className="flex items-center">
								<FormControl>
									<Checkbox
										className="mt-2 mr-3"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>Wizyta ma się odbyć na inny adres</FormLabel>
								<FormMessage />
							</FormItem>
						)}
					/>

					{watch('visitAtSecondary') && (
						<div>
							{getCombo({
								fieldLabel: 'Dane addressowe',
								fieldName: 'secondaryAddress.country',
								optionList: options.countryOptions,
							})}
							<div className="flex gap-4 pt-2">
								<FormField
									control={control}
									name="secondaryAddress.street"
									render={({ field }) => (
										<FormItem className="flex-[2]">
											<FormControl>
												<Input placeholder="Ulica" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="secondaryAddress.houseNumber"
									render={({ field }) => (
										<FormItem className="flex-[1]">
											<FormControl>
												<Input placeholder="Nr lokalu" type="number" min={1} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					)}

					{allPatients.map((_, i) => {
						return (
							<Card key={i}>
								<CardHeader>
									<h1>Pacjent {RN[i]}</h1>
								</CardHeader>
								<CardContent>
									<FormField
										control={control}
										name={`'patients.${i}.ageGroup` as `patients.${number}.ageGroup`}
										render={({ field }) => (
											<FormItem className="flex items-center">
												<FormLabel>Wiek pacjeta</FormLabel>
												<FormControl>
													<Tabs value={field.value} onValueChange={field.onChange}>
														<TabsList>
															{ageGroupOptions.map((aG) => (
																<TabsTrigger key={aG} value={aG}>
																	{aG}
																</TabsTrigger>
															))}
														</TabsList>
													</Tabs>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="flex gap-4">
										<FormField
											control={control}
											name={`'patients.${i}.firstName` as `patients.${number}.firstName`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input placeholder="Imie" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name={`'patients.${i}.lastName` as `patients.${number}.lastName`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input placeholder="Nazwisko" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{getCombo(
										{
											fieldLabel: 'Symptomy',
											fieldName: 'patients.' + [i] + '.symptoms',
											optionList: options.countryOptions,
										},
										true
									)}

									<FormField
										control={control}
										name={`'patients.${i}.idType` as `patients.${number}.idType`}
										render={({ field }) => (
											<FormItem className="flex items-center">
												<FormControl>
													<Tabs value={field.value} onValueChange={field.onChange}>
														<TabsList>
															{idTypeOptions.map((idt) => (
																<TabsTrigger key={idt} value={idt}>
																	{idt}
																</TabsTrigger>
															))}
														</TabsList>
													</Tabs>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={control}
										name={`'patients.${i}.idVal` as `patients.${number}.idVal`}
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormControl>
													<Input placeholder="Id val" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>
						)
					})}

					<div className="flex gap-4">
						<Button
							type="button"
							onClick={addPatient}
							disabled={allPatients.length > 5}
							className="w-full"
						>
							Add another patient
						</Button>

						<Button
							type="button"
							onClick={removePatient}
							disabled={allPatients.length < 2}
							className="w-full"
						>
							Remove last patient
						</Button>
					</div>

					<Button type="submit" className="w-full">
						Submit
					</Button>
				</form>
			</Form>
			<div className="w-min formNav">
				<Accordion type="multiple" defaultValue={['item-2']}>
					<AccordionItem value="item-1">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</>
	)
}


'use client'

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
import React, { useMemo } from 'react'
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
import Combo from '@/components/Combo'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const visitOptions = ['homeVisit']
const specOptions = ['generalMedicine', 'cardiology', 'dermatology', 'pediatrics', 'neurology']
const topicOptions = ['consultation', 'followUp', 'emergency', 'checkup', 'diagnosis']
const languageOptions = ['english', 'polish']
const symptomOptions = ['fever', 'cough', 'headache', 'nausea', 'fatigue']
const countryOptions = ['england', 'poland']
const idTypeOptions = ['passport', 'pesel']
const ageGroupOptions = ['child', 'adult']

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

const RN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const

const generateRange = ([start, end]: [start: number, end: number]) =>
	Array.from({ length: end - start + 1 }, (_, i) => String(start + i))

export default function HomeVisitForm() {
	const addressSchema = z.object({
		country: z.string().refine((country) => countryOptions.includes(country), {
			message: 'Invalid country',
		}),
		street: z.string().min(3),
		houseNumber: z.coerce.number().min(1, 'Invalid house nr'),
	})

	const patientSchema = z.object({
		ageGroup: z.string().refine((ageGroup) => ageGroupOptions.includes(ageGroup), {
			message: 'Invalid ageGroup',
		}),
		firstName: z.string(),
		lastName: z.string(),
		symptoms: z
			.array(z.string())
			.refine((symptoms) => symptoms.every((symptom) => symptomOptions.includes(symptom)), {
				message: 'Invalid symptom(s) found.',
			}),
		idType: z.string().refine((idType) => idTypeOptions.includes(idType), {
			message: 'Invalid idType',
		}),
		idVal: z.string(),
	})

	const formSchema = z
		.object({
			requestId: z.string().min(6, 'Request id too short'),
			visitType: z.string().refine((value) => visitOptions.includes(value), 'Invalid visit type'),
			specialization: z.string().refine((value) => {
				return specOptions.includes(value)
			}, 'Invalid specialization'),
			topic: z.string().refine((value) => topicOptions.includes(value), 'Invalid topic'),
			visitDate: z
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)), 'Visit date too early')
				.max(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'Visit date too late'),
			provideTimeRange: z.boolean(),
			visitFrom: z.coerce
				.number()
				.min(0, 'Visit time too early')
				.max(22, 'Visit time too late')
				.optional(),
			visitTo: z.coerce
				.number()
				.min(0, 'Visit time too early')
				.max(23, 'Visit time too late')
				.optional(),
			language: z.string().refine((value) => languageOptions.includes(value), 'Invalid language'),
			additionalInfo: z.string().optional(),
			homeAddress: addressSchema,
			visitAtSecondary: z.boolean(),
			secondaryAddress: z.optional(addressSchema),
			patients: patientSchema.array().min(1).max(6),
		})
		.refine(
			(data) => {
				if (data.provideTimeRange) {
					return data.visitFrom !== undefined && data.visitTo !== undefined
				}
				return true
			},
			{
				message: 'Field required',
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
			{ message: 'Invalid visit start time', path: ['visitFrom'] }
		)
		.refine(
			(data) =>
				data.provideTimeRange ? (data.visitTo as number) > (data.visitFrom as number) + 1 : true,
			{ message: 'Invalid visit end time', path: ['visitTo'] }
		)
		.refine(
			(data) => {
				if (data.visitAtSecondary) {
					return data.secondaryAddress !== undefined
				}
				return true
			},
			{
				message: 'Secondary address is required',
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
		ageGroup: ageGroupOptions[0],
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
			visitType: visitOptions[0],
			specialization: '',
			topic: '',
			visitDate: new Date(new Date().setHours(0, 0, 0, 0)),
			provideTimeRange: false,
			language: '',
			additionalInfo: '',
			homeAddress: { ...blankAddress },
			visitAtSecondary: false,

			patients: [{ ...blankPatient }],
		},
	})

	console.log(form.watch('visitType'))

	const bookedDate = form.watch('visitDate')
	const bookedDateStart = form.watch('visitFrom')
	const wantsProvidedTime = form.watch('provideTimeRange')

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

	const selectPlaceholder = 'Wybierz z listy'
	const searchPlaceholder = 'Wyszukaj z listy'
	const missingPlaceholder = 'Brak wynikow z tym wyszukaniem'

	const specializationCombo = {
		form,
		field: {
			value: 'specialization',
			label: 'Specjalizacja',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		itemList: specOptions.map((s) => ({ label: s, value: s })),
	}

	const topicCombo = {
		form,
		field: {
			value: 'topic',
			label: 'Temat',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		itemList: topicOptions.map((s) => ({ label: s, value: s })),
	}

	const languageCombo = {
		form,
		field: {
			value: 'language',
			label: 'Jezyk',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		itemList: languageOptions.map((s) => ({ label: s, value: s })),
	}

	const countryCombo = {
		form,
		field: {
			value: 'homeAddress.country',
			label: 'Dane adresowe',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		itemList: countryOptions.map((s) => ({ label: s, value: s })),
	}

	const countrySecondaryCombo = {
		form,
		field: {
			value: 'secondaryAddress.country',
			label: 'Dane adresowe',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		itemList: countryOptions.map((s) => ({ label: s, value: s })),
	}

	const allPatients = form.watch('patients')

	function removePatient() {
		if (form.getValues('patients').length > 1) {
			const currentPatients = form.getValues('patients')
			currentPatients.pop()

			form.setValue('patients', currentPatients)
		}
	}

	function addPatient() {
		if (form.getValues('patients').length < 6) {
			const currentPatients = form.getValues('patients')

			form.setValue('patients', [...currentPatients, { ...blankPatient }])
		}
	}

	const getSymptomsCombo = (pNum: number) => ({
		form,
		field: {
			value: `patients.${pNum}.lastName`,
			label: 'Symptomy (Opcjonalne)',
			selectPlaceholder,
			searchPlaceholder,
			missingPlaceholder,
		},
		multiSelect: true,
		itemList: symptomOptions.map((s) => ({ label: s, value: s })),
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-8">
				<FormField
					control={form.control}
					name="requestId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Numer zgłoszenia</FormLabel>
							<FormControl>
								<Input placeholder="Wpisz numer zgłoszenia" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="visitType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Rodzaj wizyty</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={visitOptions[0]} disabled>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value={visitOptions[0]}>Wizyta domowa</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Combo {...specializationCombo} />

				<FormField
					control={form.control}
					name="visitDate"
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
					control={form.control}
					name="provideTimeRange"
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

				<div>
					<FormLabel>Godzina</FormLabel>
					<div className="flex">
						<FormField
							control={form.control}
							name="visitFrom"
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
							control={form.control}
							name="visitTo"
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

				<Combo {...topicCombo} />

				<FormField
					control={form.control}
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

				<Combo {...languageCombo} />

				<div>
					<Combo {...countryCombo} />
					<div className="flex gap-4 pt-2">
						<FormField
							control={form.control}
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
							control={form.control}
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
					control={form.control}
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

				{form.watch('visitAtSecondary') && (
					<div>
						<Combo {...countrySecondaryCombo} />
						<div className="flex gap-4 pt-2">
							<FormField
								control={form.control}
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
								control={form.control}
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

				{allPatients.map((p, i) => {
					return (
						<Card>
							<CardHeader>
								<h1>Pacjent {RN[i]}</h1>
							</CardHeader>
							<CardContent>
								<FormField
									control={form.control}
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
										control={form.control}
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
										control={form.control}
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
								<Combo {...getSymptomsCombo(i)} />
								<FormField
									control={form.control}
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
									control={form.control}
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
	)
}


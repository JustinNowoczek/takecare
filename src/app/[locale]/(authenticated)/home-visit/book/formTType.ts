interface Field {
	fieldLabel: string
}

interface FieldWithPlaceholder extends Field {
	fieldPlaceholder: string
}

type FieldWithSelectPlaceholder = {
	selectPlaceholder: string
}

type VisitScheduleFields = {
	visitDate: FieldWithPlaceholder
	provideTimeRange: Field
	visitFrom: FieldWithSelectPlaceholder
	visitTo: FieldWithSelectPlaceholder
}

type AddressFields = {
	country: Field
	street: FieldWithPlaceholder
	houseNumber: FieldWithPlaceholder
}

type FormFields = {
	requestId: FieldWithPlaceholder
	visitType: Field
	specialization: Field
	visitSchedule: VisitScheduleFields
	topic: Field
	additionalInfo: FieldWithPlaceholder
	language: Field
	address: AddressFields
	visitAtSecondary: Field
}

type PatientFields = {
	ageGroup: Field
	firstName: FieldWithPlaceholder
	lastName: FieldWithPlaceholder
	symptoms: Field
	idType: Field
	idVal: FieldWithPlaceholder
	birthDate: FieldWithPlaceholder
}

type GenericMessages = {
	selectPlaceholder: string
	selectMismatch: string
	searchPlaceholder: string
	searchMismatch: string
	inputMismatch: string
	timeMismatch: string
	requiredField: string
	addPatient: string
	removePatient: string
	submit: string
}

export type FormTType = {
	title: string
	fields: FormFields
	patientTitle: string
	patientFields: PatientFields
	genericMessages: GenericMessages
}


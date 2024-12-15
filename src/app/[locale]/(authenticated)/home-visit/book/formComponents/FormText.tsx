import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	fieldLabel: string
	fieldPlaceholder: string
}

export default function FormText<T extends FieldValues>({
	control,
	fieldName,
	fieldLabel,
	fieldPlaceholder,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName} className="flex-[2] w-full">
					<FormLabel>{fieldLabel}</FormLabel>
					<FormControl>
						<Input placeholder={fieldPlaceholder} {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


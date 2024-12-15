import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { Checkbox } from '@/components/ui/checkbox'
import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	fieldLabel: string
}

export default function FormCheckbox<T extends FieldValues>({
	control,
	fieldName,
	fieldLabel,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName} className="flex items-center">
					<FormControl>
						<Checkbox
							className="mt-2 mr-3"
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					</FormControl>
					<FormLabel>{fieldLabel}</FormLabel>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


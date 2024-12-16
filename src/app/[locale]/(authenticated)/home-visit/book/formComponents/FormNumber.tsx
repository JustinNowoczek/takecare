import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	fieldPlaceholder: string
}

export default function FormNumber<T extends FieldValues>({
	control,
	fieldName,
	fieldPlaceholder,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName} className="flex-[1]">
					<FormLabel className="font-bold text-tcprimaryDark" />
					<FormControl>
						<Input placeholder={fieldPlaceholder} type="number" min={1} {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


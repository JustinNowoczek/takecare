import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	selectPlaceholder: string
	timeRange: [number, number]
}

const generateRange = ([start, end]: [start: number, end: number]) =>
	Array.from({ length: end - start + 1 }, (_, i) => String(start + i))

export default function FormHourSelect<T extends FieldValues>({
	control,
	fieldName,
	selectPlaceholder,
	timeRange,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName} className="w-full">
					<Select onValueChange={field.onChange}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder={selectPlaceholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{generateRange(timeRange).map((n) => (
								<SelectItem key={n} value={n}>
									{n + ':00'}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


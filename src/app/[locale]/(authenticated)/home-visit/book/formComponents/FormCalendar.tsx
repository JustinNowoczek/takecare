import './calendar.css'

import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { format } from 'date-fns'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	fieldLabel: string
	fieldPlaceholder: string
	disabled: (date: Date) => boolean
	isDob?: boolean
}

export default function FormCalendar<T extends FieldValues>({
	control,
	fieldName,
	fieldLabel,
	fieldPlaceholder,
	disabled,
	isDob = false,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName} className="flex flex-col">
					<FormLabel>{fieldLabel}</FormLabel>
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button variant={'outline'} className={!field.value ? 'text-muted-foreground' : ''}>
									{field.value ? format(field.value, 'PPP') : <span>{fieldPlaceholder}</span>}
									<ChevronDown className="opacity-50 ml-auto w-4 h-4" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="p-0 w-auto" align="start">
							<Calendar
								id={isDob ? 'dobCalendar' : ''}
								captionLayout={isDob ? 'dropdown' : 'buttons'}
								fromYear={isDob ? new Date().getFullYear() - 100 : undefined}
								toYear={isDob ? new Date().getFullYear() : undefined}
								weekStartsOn={1}
								mode="single"
								selected={field.value}
								onSelect={field.onChange}
								disabled={disabled}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


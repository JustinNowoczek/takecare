import { Check, ChevronDown } from 'lucide-react'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command'
import { FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

import { Button } from './ui/button'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'

type Props = {
	form: UseFormReturn<any>
	field: {
		value: string
		label: string
		selectPlaceholder: string
		searchPlaceholder: string
		missingPlaceholder: string
	}
	itemList: { value: string; label: string }[]
	multiSelect?: boolean
}

export default function Combo({
	form,
	field: { label, value, selectPlaceholder, searchPlaceholder, missingPlaceholder },
	itemList,
	multiSelect = false,
}: Props) {
	return (
		<FormField
			control={form.control}
			name={value}
			render={({ field }) => (
				<FormItem className="flex flex-col">
					<FormLabel>{label}</FormLabel>
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									role="combobox"
									className={
										'w-full justify-between ' +
										(!field.value || (Array.isArray(field.value) && field.value.length === 0)
											? 'text-muted-foreground'
											: '')
									}
								>
									{field.value &&
									(Array.isArray(field.value) ? field.value : [field.value]).length > 0
										? itemList
												.filter((item) =>
													Array.isArray(field.value)
														? field.value.includes(item.value)
														: field.value === item.value
												)
												.map((item) => item.label)
												.join(', ')
										: selectPlaceholder}
									<ChevronDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent align="start" className="p-0 w-fit">
							<Command>
								<CommandInput placeholder={searchPlaceholder} />
								<CommandList>
									<CommandEmpty>{missingPlaceholder}</CommandEmpty>
									<CommandGroup>
										{itemList.map((item) => (
											<CommandItem
												key={item.value}
												onSelect={() => {
													const updatedValue = Array.isArray(field.value)
														? [...field.value]
														: [field.value]
													if (multiSelect) {
														if (updatedValue.includes(item.value)) {
															const index = updatedValue.indexOf(item.value)
															updatedValue.splice(index, 1)
														} else {
															updatedValue.push(item.value)
														}
													} else {
														updatedValue[0] = item.value
													}
													form.setValue(value, multiSelect ? updatedValue : updatedValue[0])
												}}
											>
												<div className="flex items-center">
													<Check
														className={
															'ml-auto ' +
															(Array.isArray(field.value)
																? field.value.includes(item.value)
																	? 'opacity-100'
																	: 'opacity-0'
																: field.value === item.value
																? 'opacity-100'
																: 'opacity-0')
														}
													/>
													{item.label}
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</FormItem>
			)}
		/>
	)
}


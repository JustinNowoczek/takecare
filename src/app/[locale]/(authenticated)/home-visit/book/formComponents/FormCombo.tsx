import { Check, ChevronDown } from 'lucide-react'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../../../../../../components/ui/command'
import { Control, FieldValues, Path, SetFieldValue } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../../components/ui/popover'

import { Button } from '../../../../../../components/ui/button'
import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	setValue: SetFieldValue<T>
	fieldName: Path<T>
	fieldLabel: string
	optionList: { optionName: string; optionLabel: string }[]
	selectPlaceholder: string
	searchPlaceholder: string
	searchMismatch: string
	multiSelect?: boolean
}

export default function FormCombo<T extends FieldValues>({
	control,
	setValue,
	fieldName,
	fieldLabel,
	optionList,
	selectPlaceholder,
	searchPlaceholder,
	searchMismatch,
	multiSelect = false,
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
								<div>
									<Button
										variant="outline"
										role="combobox"
										className={
											'w-full justify-between ' +
											(!field.value || (Array.isArray(field.value) && field.value.length === 0)
												? 'text-muted-foreground'
												: '')
										}
										type="button"
									>
										{field.value &&
										(Array.isArray(field.value) ? field.value : [field.value]).length > 0
											? optionList
													.filter(({ optionName }) =>
														Array.isArray(field.value)
															? field.value.includes(optionName)
															: field.value === optionName
													)
													.map(({ optionLabel }) => optionLabel)
													.join(', ')
											: selectPlaceholder}
										<ChevronDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
									</Button>
									<FormMessage />
								</div>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent align="start" className="p-0 w-fit">
							<Command>
								<CommandInput placeholder={searchPlaceholder} />
								<CommandList>
									<CommandEmpty>{searchMismatch}</CommandEmpty>
									<CommandGroup>
										{optionList.map(({ optionLabel, optionName }) => (
											<CommandItem
												key={optionName}
												onSelect={() => {
													const updatedValue = Array.isArray(field.value)
														? [...field.value]
														: [field.value]
													if (multiSelect) {
														if (updatedValue.includes(optionName)) {
															const index = updatedValue.indexOf(optionName)
															updatedValue.splice(index, 1)
														} else {
															updatedValue.push(optionName)
														}
													} else {
														updatedValue[0] = optionName
													}
													setValue(fieldName, multiSelect ? updatedValue : updatedValue[0], {
														shouldValidate: true,
													})
												}}
											>
												<div className="flex items-center gap-2">
													<Check
														className={
															'ml-auto ' +
															(Array.isArray(field.value)
																? field.value.includes(optionName)
																	? 'opacity-100'
																	: 'opacity-0'
																: field.value === optionName
																? 'opacity-100'
																: 'opacity-0')
														}
													/>
													{optionLabel}
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


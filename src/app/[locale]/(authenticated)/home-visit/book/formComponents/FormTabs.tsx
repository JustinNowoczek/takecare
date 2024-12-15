import { Control, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import React from 'react'

type Props<T extends FieldValues> = {
	control: Control<T>
	fieldName: Path<T>
	fieldLabel: string
	optionList: { optionName: string; optionLabel: string }[]
}

export default function FormTabs<T extends FieldValues>({
	control,
	fieldName,
	fieldLabel,
	optionList,
}: Props<T>) {
	return (
		<FormField
			control={control}
			name={fieldName}
			render={({ field }) => (
				<FormItem id={fieldName}>
					<FormControl className="flex flex-col gap-2 w-full">
						<div>
							<FormLabel className="text-tcprimaryDark">{fieldLabel}</FormLabel>
							<Tabs
								defaultValue={optionList[0].optionName}
								value={field.value}
								onValueChange={field.onChange}
							>
								<TabsList className="bg-tcswitchBackground w-full h-[46px]">
									{optionList.map(({ optionLabel, optionName }) => (
										<TabsTrigger className="w-full" key={optionName} value={optionName}>
											{optionLabel}
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}


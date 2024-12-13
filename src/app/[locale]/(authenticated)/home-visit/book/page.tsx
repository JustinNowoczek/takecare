import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

import HomeVisitForm from './HomeVisitForm'

export default function HomeVisit() {
	return (
		<main className="flex gap-5">
			<HomeVisitForm />
			<div className="w-min formNav">
				<Accordion type="multiple" defaultValue={['item-2']}>
					<AccordionItem value="item-1">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</main>
	)
}

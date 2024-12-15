import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default function HomeVisit() {
	return (
		<main className="flex flex-col justify-center items-center gap-10 size-full">
			Home visit page
			<Button>
				<Link href={'/home-visit/book'}> Go to showcase page</Link>
			</Button>
		</main>
	)
}

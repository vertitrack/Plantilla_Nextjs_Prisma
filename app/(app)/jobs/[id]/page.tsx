import { JobDetail } from "@/components/job/job-detail";

export default async function JobPage({
	params,
	searchParams,
}: PageProps<"/jobs/[id]">) {
	const { id } = await params;
	const { tab, auto } = await searchParams;
	return (
		<JobDetail
			id={id}
			initialTab={typeof tab === "string" ? tab : "evaluation"}
			autoTailor={auto === "1"}
		/>
	);
}

import { CompletionScreen } from "./CompletionScreen";

export default async function ProblemCompletedPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ submission?: string }>;
}) {
    const [{ id }, { submission }] = await Promise.all([params, searchParams]);
    return <CompletionScreen problemSlug={id} submissionId={submission ?? ""} />;
}

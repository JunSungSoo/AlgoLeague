import { ProblemCatalogScreen } from "@/components/ProblemCatalogScreen";

export default function MyProblemsPage() {
    return (
        <ProblemCatalogScreen
            endpoint="/api/my-problems"
            eyebrow="MY PROBLEMS"
            title="나의 문제"
            description="한 번이라도 제출했던 문제와 해결 기록을 다시 확인하세요."
        />
    );
}

import { ProblemCatalogScreen } from "@/components/ProblemCatalogScreen";

export default function ProblemsPage() {
    return (
        <ProblemCatalogScreen
            endpoint="/api/problems"
            eyebrow="PROBLEM CATALOG"
            title="문제 탐색"
            description="현재 등급과 한 단계 높은 문제까지 자유롭게 도전하세요. 최초 정답만 승급 실적에 반영됩니다."
            defaultGrade="mine"
        />
    );
}

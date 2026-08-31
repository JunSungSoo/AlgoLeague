import { ProblemCatalogScreen } from "@/components/ProblemCatalogScreen";

export default function ProblemsPage() {
    return <ProblemCatalogScreen endpoint="/api/problems" defaultGrade="mine" />;
}

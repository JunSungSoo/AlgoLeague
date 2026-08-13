export type GradeSortDirection = "desc" | "asc";
export type GradeSortableProblem = { grade: number; accessible: boolean };

export function sortProblemCatalog<T extends GradeSortableProblem>(
    items: T[],
    userGrade: number,
    direction: GradeSortDirection,
) {
    const gradeOrder = direction === "desc" ? -1 : 1;
    return items
        .map((item, index) => ({ item, index }))
        .sort((left, right) => {
            const leftGroup = left.item.grade === userGrade ? 0 : left.item.accessible ? 1 : 2;
            const rightGroup = right.item.grade === userGrade ? 0 : right.item.accessible ? 1 : 2;
            if (leftGroup !== rightGroup) return leftGroup - rightGroup;
            if (left.item.grade !== right.item.grade)
                return (left.item.grade - right.item.grade) * gradeOrder;
            return left.index - right.index;
        })
        .map(({ item }) => item);
}

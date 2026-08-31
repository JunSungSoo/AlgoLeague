export const NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE = "사용 가능한 문제 생성 공급자가 없습니다.";

export function generationFailureMessage(failureReason: string | null): string | null {
    if (!failureReason) return null;

    return failureReason.startsWith(NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE)
        ? NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE
        : failureReason;
}

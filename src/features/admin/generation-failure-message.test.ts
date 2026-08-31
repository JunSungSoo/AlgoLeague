import { describe, expect, it } from "vitest";
import {
    generationFailureMessage,
    NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE,
} from "./generation-failure-message";

describe("generationFailureMessage", () => {
    it("공급자 응답을 화면용 문구에서 제거한다", () => {
        expect(
            generationFailureMessage(
                `${NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE} openrouter: HTTP 429: {"error":"rate limit"}`,
            ),
        ).toBe(NO_AVAILABLE_GENERATION_PROVIDER_MESSAGE);
    });

    it("다른 실패 사유는 그대로 표시한다", () => {
        expect(generationFailureMessage("문제 생성 최대 재시도 횟수를 초과했습니다.")).toBe(
            "문제 생성 최대 재시도 횟수를 초과했습니다.",
        );
    });
});

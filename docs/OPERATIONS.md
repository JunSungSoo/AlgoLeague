# 운영 및 배포 런북

## 로컬 기동

1. 프런트엔드와 형제 백엔드 저장소의 `.env.example`을 각각 `.env`로 복사하고 백엔드에 32자 이상의 임의 `SESSION_SECRET`을 설정한다.
2. `docker compose up -d postgres redis`를 실행한다.
3. `../algorithm-champions-back`에서 `yarn db:migrate && yarn db:seed`를 실행한다.
4. 백엔드 저장소와 프런트엔드 저장소에서 각각 `yarn dev`를 실행한다.
5. 워커는 `docker compose --profile workers up`으로 별도 기동한다. Judge 워커는 신뢰된 전용 노드에서만 운영한다.

## 배포 게이트

프런트엔드와 `../algorithm-champions-back` 저장소에서 각각 lint, typecheck, test, build를 통과해야 한다. 이후 두 컨테이너의 취약점 스캔, SBOM, 이미지 서명, 마이그레이션 dry-run, 백업 복구 연습과 핵심 E2E를 수행한다.

`main` 푸시와 PR은 CI 검증을 수행한다. `v*` 태그는 재현 가능한 프로덕션 이미지를 빌드해 GHCR에 SBOM·provenance와 함께 게시한다. 실제 클라우드 승격은 운영 계정, 도메인과 비밀 관리 대상이 확정된 뒤 환경 승인 단계로 연결한다.

## 장애 처리

- Judge 장애: 신규 제출은 `JH`로 보류하고 횟수를 차감하지 않는다. 워커 복구 뒤 기존 작업 ID로 재채점한다.
- Queue 장애: API는 중복 방지 키와 제출 원장을 남기고 503을 반환한다. 복구 후 outbox를 재전송한다.
- 문제 오류: 상태를 `INVALIDATED`로 변경하고 신규 제출을 차단한다. 영향 해결 원장을 void 처리해 등급·랭킹을 재계산하고 대체 문제를 배정한다.
- 문제 재고: 접근 가능 등급별 30일 미만이면 운영 경보를 발송한다. 당일 생성 후보를 즉시 게시하지 않는다.
- 보안 사건: 해당 워커 풀을 격리하고 이미지 digest, 실행 로그, 감사 로그를 보존한다. 비공개 테스트가 노출됐을 가능성이 있으면 비밀을 회전하고 영향을 받은 문제를 연습 문제로 전환한다.

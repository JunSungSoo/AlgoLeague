# 알고리그

공식 마스코트는 작은 눈과 둥근 안경을 쓴 통통한 수달 **알고달**입니다.

브랜드 일러스트는 `public/brand`에 보관합니다. `algodal-coding-meadow-wide-v2.png`는 개별 특징을 가진 알고달과 친구들의 최종 가로형 코딩 초원 장면이며, 이전 버전도 비교를 위해 보존합니다. 외부 참고 이미지는 재사용 자산과 구분해 `public/brand/references`에 보관합니다.

매일 검증된 알고리즘 문제를 풀고 누적 실적으로 등급을 성장시키는 PC 웹 MVP입니다. 이 저장소는 Next.js 프런트엔드만 소유하며, 서버 기능은 형제 저장소 `../algorithm-champions-back`에서 관리합니다.

## 포함된 기능

- Next.js 16 PC 웹: 대시보드, 문제 탐색, 분할 코드 편집기, 랭킹, 프로필, 운영자 생성 현황
- 별도 `algorithm-champions-back` 저장소의 Fastify API와 PostgreSQL 원장
- 정책 엔진: 접근, 누적 승급, 14일 강등, 챔피언 자격 박탈, 제출 제한, KST 배정과 개념 회피
- Redis 워커: 비동기 채점과 AI 문제 생성 상태
- 네 언어 Docker 샌드박스: Python, Java, JavaScript, C++
- AI 생성: Structured Outputs, schema 검증, 고정 seed와 자동/사람 승인 분기

## 빠른 시작

```bash
yarn install
cp .env.example .env
yarn dev
```

프런트엔드는 `http://localhost:3000`, 별도 백엔드 저장소는 `http://localhost:4000`에서 실행됩니다. 백엔드 실행과 데이터베이스 설정은 `../algorithm-champions-back/README.md`를 참고하세요.

브라우저의 로그인·데이터 요청은 같은 Origin의 `/api/*`로 전송되고 Next.js가 `API_PROXY_TARGET`의 백엔드로 전달합니다. HTTPS 개발 환경에서도 CORS와 혼합 콘텐츠 문제 없이 세션 쿠키를 사용할 수 있습니다.

상세 요구사항은 [개발 명세](docs/DEVELOPMENT_SPEC.md), 배포·복구는 [운영 런북](docs/OPERATIONS.md)을 참고하세요.

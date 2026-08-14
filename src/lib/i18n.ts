export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "algoleague-locale";
export const DEFAULT_LOCALE: AppLocale = "ko";

const KO = {
    "brand.name": "알고리그",
    "header.openMenu": "메뉴 열기",
    "header.home": "알고리그 홈",
    "header.notifications": "알림",
    "header.settings": "설정",
    "header.languageSettings": "언어 설정",
    "header.languageDescription": "서비스 표시 언어를 선택하세요.",
    "header.profile": "내 프로필로 이동",
    "nav.navigation": "메뉴",
    "nav.home.label": "홈",
    "nav.home.caption": "오늘의 학습",
    "nav.problems.label": "문제",
    "nav.problems.caption": "문제 탐색",
    "nav.myProblems.label": "나의 문제",
    "nav.myProblems.caption": "풀이 기록",
    "nav.ranking.label": "랭킹",
    "nav.ranking.caption": "등급별 순위",
    "nav.profile.label": "프로필",
    "nav.profile.caption": "성장 기록",
    "nav.admin.label": "운영",
    "nav.admin.caption": "관리자 도구",
    "account.guest": "게스트",
    "account.verifiedSolves": "{{grade}}급 · 검증 정답 {{count}}개",
    "account.loginRequired": "로그인이 필요합니다",
    "account.login": "로그인",
    "account.logout": "로그아웃",
    "account.profileImage": "{{nickname}} 프로필 사진",
} as const;

export type TranslationKey = keyof typeof KO;
type Dictionary = Record<TranslationKey, string>;

const EN: Dictionary = {
    "brand.name": "AlgoLeague",
    "header.openMenu": "Open menu",
    "header.home": "AlgoLeague home",
    "header.notifications": "Notifications",
    "header.settings": "Settings",
    "header.languageSettings": "Language",
    "header.languageDescription": "Choose the language used in the service.",
    "header.profile": "Open my profile",
    "nav.navigation": "Navigation",
    "nav.home.label": "Home",
    "nav.home.caption": "Today's learning",
    "nav.problems.label": "Problems",
    "nav.problems.caption": "Explore problems",
    "nav.myProblems.label": "My Problems",
    "nav.myProblems.caption": "Solution history",
    "nav.ranking.label": "Ranking",
    "nav.ranking.caption": "Rank standings",
    "nav.profile.label": "Profile",
    "nav.profile.caption": "Growth history",
    "nav.admin.label": "Operations",
    "nav.admin.caption": "Admin tools",
    "account.guest": "Guest",
    "account.verifiedSolves": "Grade {{grade}} · {{count}} verified solves",
    "account.loginRequired": "Login required",
    "account.login": "Log in",
    "account.logout": "Log out",
    "account.profileImage": "{{nickname}}'s profile image",
};

const JA: Dictionary = {
    "brand.name": "アルゴリーグ",
    "header.openMenu": "メニューを開く",
    "header.home": "アルゴリーグ ホーム",
    "header.notifications": "お知らせ",
    "header.settings": "設定",
    "header.languageSettings": "言語設定",
    "header.languageDescription": "サービスの表示言語を選択してください。",
    "header.profile": "プロフィールを開く",
    "nav.navigation": "メニュー",
    "nav.home.label": "ホーム",
    "nav.home.caption": "今日の学習",
    "nav.problems.label": "問題",
    "nav.problems.caption": "問題を探す",
    "nav.myProblems.label": "自分の問題",
    "nav.myProblems.caption": "解答履歴",
    "nav.ranking.label": "ランキング",
    "nav.ranking.caption": "級別順位",
    "nav.profile.label": "プロフィール",
    "nav.profile.caption": "成長記録",
    "nav.admin.label": "運営",
    "nav.admin.caption": "管理者ツール",
    "account.guest": "ゲスト",
    "account.verifiedSolves": "{{grade}}級 · 検証済み正解 {{count}}問",
    "account.loginRequired": "ログインが必要です",
    "account.login": "ログイン",
    "account.logout": "ログアウト",
    "account.profileImage": "{{nickname}}のプロフィール画像",
};

export const DICTIONARIES: Record<AppLocale, Dictionary> = { ko: KO, en: EN, ja: JA };

export const LOCALE_OPTIONS: Array<{ value: AppLocale; label: string; shortLabel: string }> = [
    { value: "ko", label: "한국어", shortLabel: "KO" },
    { value: "en", label: "English", shortLabel: "EN" },
    { value: "ja", label: "日本語", shortLabel: "JA" },
];

export function isAppLocale(value: string | null): value is AppLocale {
    return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function translate(
    locale: AppLocale,
    key: TranslationKey,
    values: Record<string, string | number> = {},
) {
    return Object.entries(values).reduce(
        (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
        DICTIONARIES[locale][key],
    );
}

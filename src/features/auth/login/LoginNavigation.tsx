import NextLink from "next/link";
import { Link, Text } from "@chakra-ui/react";
import { LockKeyhole } from "lucide-react";
import { FlexLayout } from "@/components/ui";
import { ROUTES } from "@/lib/route-paths";

export function LoginNavigation() {
    return (
        <>
            <FlexLayout
                mt="28px"
                pt="22px"
                borderTopWidth="1px"
                borderColor="line"
                layout="center"
                gap="8px"
                fontSize="14px"
            >
                <Text color="muted">아직 회원이 아니신가요?</Text>
                <Link asChild color="accent" fontWeight="800">
                    <NextLink href={ROUTES.SIGNUP}>회원가입</NextLink>
                </Link>
            </FlexLayout>
            <FlexLayout mt="10px" layout="center" gap="10px" color="muted" fontSize="11px">
                <Link asChild color="muted">
                    <NextLink href={ROUTES.FIND_ID}>아이디 찾기</NextLink>
                </Link>
                <Text>·</Text>
                <Link asChild color="muted">
                    <NextLink href={ROUTES.RESET_PASSWORD}>비밀번호 찾기</NextLink>
                </Link>
            </FlexLayout>
            <FlexLayout mt="20px" layout="center" color="muted" gap="6px" fontSize="11px">
                <LockKeyhole size={13} />
                비밀번호는 암호화되어 안전하게 보관됩니다.
            </FlexLayout>
        </>
    );
}

import { Flex, type FlexProps } from "@chakra-ui/react";

type FlexLayoutProps = FlexProps & {
    layout?: "row" | "responsive" | "between" | "center";
};

export function FlexLayout({ layout = "row", ...props }: FlexLayoutProps) {
    const layoutProps: FlexProps =
        layout === "responsive"
            ? { direction: { base: "column", sm: "row" }, gap: "8px" }
            : layout === "between"
              ? { align: "center", justify: "space-between" }
              : layout === "center"
                ? { align: "center", justify: "center" }
                : {};

    return <Flex {...layoutProps} {...props} />;
}

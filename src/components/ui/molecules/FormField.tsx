import { Field } from "@chakra-ui/react";

type FormFieldProps = {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    helperText?: React.ReactNode;
    errorText?: React.ReactNode;
    invalid?: boolean;
    mt?: string | number;
};

export function FormField({
    label,
    children,
    required = false,
    helperText,
    errorText,
    invalid,
    mt,
}: FormFieldProps) {
    return (
        <Field.Root required={required} invalid={invalid} mt={mt}>
            <Field.Label>
                {label} {required ? <Field.RequiredIndicator /> : null}
            </Field.Label>
            {children}
            {helperText ? <Field.HelperText>{helperText}</Field.HelperText> : null}
            {errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
        </Field.Root>
    );
}

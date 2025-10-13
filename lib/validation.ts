import { z } from "zod";

const optionalNumberField = z.preprocess(
    (value: unknown) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        return value;
    },
    z
        .coerce
        .number({ invalid_type_error: "number_invalid" })
        .int("number_invalid")
        .nonnegative("number_invalid")
);

export const intakeSchema = z.object({
    consent: z.boolean().refine((value: boolean) => value, "consent_required"),
    customer_name: z
        .string()
        .trim()
        .min(1, "customer_name_required"),
    phone: z
        .string()
        .trim()
        .min(1, "phone_required")
        .regex(/^[0-9+\-]{8,15}$/u, "phone_invalid"),
    email: z.preprocess(
        (value: unknown) => {
            if (typeof value === "string" && value.trim().length === 0) {
                return undefined;
            }
            return value;
        },
        z.string().email("email_invalid").optional()
    ),
    address: z.preprocess(
        (value: unknown) => {
            if (typeof value === "string") {
                const trimmed = value.trim();
                if (trimmed.length === 0) {
                    return undefined;
                }
                return trimmed;
            }
            return value;
        },
        z.string().min(1, "address_required").optional()
    ),
    annual_income: optionalNumberField.optional(),
    budget_total: optionalNumberField.optional(),
    project_type: z
        .enum(["new", "reform", "warehouse"], {
            errorMap: () => ({ message: "project_type_invalid" }),
        })
        .optional(),
    from: z.preprocess(
        (value: unknown) => {
            if (typeof value === "string" && value.trim().length === 0) {
                return undefined;
            }
            return value;
        },
        z.string().optional()
    ),
});

export type IntakePayload = z.infer<typeof intakeSchema>;

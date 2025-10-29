import { z } from "zod";

const POSTAL_CODE_PATTERN = /^\d{3}-?\d{4}$/u;

const nonNegativeInteger = (field: string) =>
    z.coerce
        .number({
            invalid_type_error: `${field}_invalid`,
        })
        .int(`${field}_invalid`)
        .min(0, `${field}_invalid`);

export const simulationInputSchema = z
    .object({
        age: z.coerce
            .number({
                invalid_type_error: "age_invalid",
            })
            .int("age_invalid")
            .min(20, "age_range")
            .max(75, "age_range"),
        postalCode: z
            .string({
                invalid_type_error: "postal_code_invalid",
                required_error: "postal_code_required",
            })
            .trim()
            .regex(POSTAL_CODE_PATTERN, "postal_code_format"),
        incomeHusband: nonNegativeInteger("income_husband").refine(
            (value) => Number.isInteger(value),
            "income_husband_invalid"
        ),
        incomeWife: nonNegativeInteger("income_wife").refine(
            (value) => Number.isInteger(value),
            "income_wife_invalid"
        ),
        otherLoanAnnualRepay: nonNegativeInteger("other_loan_annual_repay"),
        headMoney: nonNegativeInteger("head_money"),
        hasLand: z.boolean({ required_error: "has_land_required" }),
        wishMonthly: nonNegativeInteger("wish_monthly"),
        termYearsSelected: z.coerce
            .number({
                invalid_type_error: "term_years_invalid",
            })
            .int("term_years_invalid")
            .min(1, "term_years_invalid"),
        bonusEnabled: z.boolean(),
        bonusPerPayment: nonNegativeInteger("bonus_per_payment")
            .optional()
            .nullable(),
    })
    .superRefine((value, ctx) => {
        if (value.bonusEnabled && value.bonusPerPayment == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bonusPerPayment"],
                message: "bonus_per_payment_required",
            });
        }
    })
    .transform((value) => ({
        ...value,
        postalCode: value.postalCode.replace(/-/gu, ""),
        bonusPerPayment: value.bonusEnabled ? value.bonusPerPayment ?? 0 : 0,
    }));

export type SimulationInput = z.infer<typeof simulationInputSchema>;

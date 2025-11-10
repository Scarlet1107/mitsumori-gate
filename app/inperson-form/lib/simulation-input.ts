import type { ClientSimulationInput } from "@/lib/client-simulation";
import type { InPersonFormData } from "@/lib/form-types";

const toNumber = (value: string | number | null | undefined, fallback = 0): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

export function buildSimulationInput(
    form: InPersonFormData,
    overrides: Partial<ClientSimulationInput> = {}
): ClientSimulationInput {
    const base: ClientSimulationInput = {
        age: toNumber(form.age, 0),
        ownIncome: toNumber(form.ownIncome, 0),
        spouseIncome: form.hasSpouse ? toNumber(form.spouseIncome, 0) : 0,
        ownLoanPayment: toNumber(form.ownLoanPayment, 0),
        spouseLoanPayment: form.hasSpouse ? toNumber(form.spouseLoanPayment, 0) : 0,
        downPayment: toNumber(form.downPayment, 0),
        wishMonthlyPayment: toNumber(form.wishMonthlyPayment, 0),
        wishPaymentYears: toNumber(form.wishPaymentYears, 0),
        hasSpouse: form.hasSpouse ?? undefined,
        usesBonus: form.usesBonus ?? undefined,
        bonusPayment: form.usesBonus === false ? 0 : toNumber(form.bonusPayment, 0),
        hasLand: form.hasLand ?? undefined,
        usesTechnostructure: form.usesTechnostructure ?? undefined,
    };

    return { ...base, ...overrides };
}

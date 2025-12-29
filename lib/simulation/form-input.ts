import type { BaseFormData } from "@/lib/form-types";
import type { SimulationInput } from "@/lib/simulation/engine";

const toNumber = (value: string | number | null | undefined, fallback = 0): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

export function buildSimulationInputFromForm(
    form: BaseFormData,
    overrides: Partial<SimulationInput> = {}
): SimulationInput {
    const base: SimulationInput = {
        name: form.name,
        email: form.email,
        age: toNumber(form.age, 0),
        spouseAge: form.hasSpouse ? toNumber(form.spouseAge, 0) : undefined,
        hasSpouse: form.hasSpouse ?? undefined,
        ownIncome: toNumber(form.ownIncome, 0),
        spouseIncome: form.hasSpouse ? toNumber(form.spouseIncome, 0) : 0,
        ownLoanPayment: toNumber(form.ownLoanPayment, 0),
        spouseLoanPayment: form.hasSpouse ? toNumber(form.spouseLoanPayment, 0) : 0,
        downPayment: toNumber(form.downPayment, 0),
        wishMonthlyPayment: toNumber(form.wishMonthlyPayment, 0),
        wishPaymentYears: toNumber(form.wishPaymentYears, 0),
        usesBonus: form.usesBonus ?? undefined,
        bonusPayment: form.usesBonus === false ? 0 : toNumber(form.bonusPayment, 0),
        hasLand: form.hasLand ?? undefined,
        hasExistingBuilding: form.hasExistingBuilding ?? undefined,
        hasLandBudget: form.hasLandBudget ?? undefined,
        landBudget: toNumber(form.landBudget, 0),
        usesTechnostructure: form.usesTechnostructure ?? undefined,
    };

    return { ...base, ...overrides };
}

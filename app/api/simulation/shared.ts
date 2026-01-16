import { calculateSimulation, type SimulationInput, type SimulationResult } from "@/lib/simulation/engine";
import { getTypedConfigs } from "@/lib/config-store";
import { createCustomer, updateCustomer, type CustomerCreateInput } from "@/lib/customer-store";
import { prisma } from "@/lib/prisma";
import type { SimulationData } from "@/lib/pdf/simulation-pdf";

export type SimulationInputPayload = SimulationInput & Record<string, unknown>;

export async function loadConfig() {
    return getTypedConfigs();
}

export function normalizeSimulationInput(input: SimulationInputPayload): SimulationInput {
    return {
        ...input,
        age: toRequiredNumber(input.age, "age"),
        spouseAge: toOptionalNumber(input.spouseAge),
        hasSpouse: toOptionalBoolean(input.hasSpouse),
        ownIncome: toRequiredNumber(input.ownIncome, "ownIncome"),
        spouseIncome: toOptionalNumber(input.spouseIncome),
        ownLoanPayment: toRequiredNumber(input.ownLoanPayment, "ownLoanPayment"),
        spouseLoanPayment: toOptionalNumber(input.spouseLoanPayment),
        downPayment: toRequiredNumber(input.downPayment, "downPayment"),
        wishMonthlyPayment: toRequiredNumber(input.wishMonthlyPayment, "wishMonthlyPayment"),
        wishPaymentYears: toRequiredNumber(input.wishPaymentYears, "wishPaymentYears"),
        usesBonus: toOptionalBoolean(input.usesBonus),
        bonusPayment: toOptionalNumber(input.bonusPayment),
        hasLand: toOptionalBoolean(input.hasLand),
        hasExistingBuilding: toOptionalBoolean(input.hasExistingBuilding),
        hasLandBudget: toOptionalBoolean(input.hasLandBudget),
        landBudget: toOptionalNumber(input.landBudget),
        usesTechnostructure: toOptionalBoolean(input.usesTechnostructure),
        usesAdditionalInsulation: toOptionalBoolean(input.usesAdditionalInsulation),
    };
}

export function toRequiredNumber(value: unknown, fieldName: string): number {
    const parsed = typeof value === "string" ? Number(value) : value;
    if (typeof parsed === "number" && Number.isFinite(parsed)) {
        return parsed;
    }
    throw new Error(`${fieldName} must be a valid number`);
}

export function toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }
    const parsed = typeof value === "string" ? Number(value) : value;
    return (typeof parsed === "number" && Number.isFinite(parsed)) ? parsed : undefined;
}

export function toOptionalBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

export async function calculateFullSimulation(input: SimulationInputPayload) {
    const config = await loadConfig();
    const normalizedInput = normalizeSimulationInput(input);
    const result = await calculateSimulation(normalizedInput, config);
    return { config, normalizedInput, result };
}

export async function persistWebFormSubmission(
    formPayload: Record<string, unknown>,
    simulationResult: SimulationResult,
    unitPricePerTsubo: number
): Promise<string> {
    const customerInput = buildCustomerInput(formPayload);

    const customer = await createCustomer({
        ...customerInput,
        inputMode: "web",
        webCompleted: true,
        inPersonCompleted: false,
    });

    await prisma.simulation.create({
        data: {
            customerId: customer.id,
            maxLoanAmount: simulationResult.maxLoanAmount,
            wishLoanAmount: simulationResult.wishLoanAmount,
            totalBudget: simulationResult.totalBudget,
            buildingBudget: simulationResult.buildingBudget,
            estimatedTsubo: simulationResult.estimatedTsubo,
            estimatedSquareMeters: simulationResult.estimatedSquareMeters,
            interestRate: simulationResult.repaymentInterestRate,
            dtiRatio: simulationResult.dtiRatio,
            unitPricePerTsubo: Math.round(unitPricePerTsubo),
        },
    });

    return customer.id;
}

export async function persistInPersonSubmission(
    formPayload: Record<string, unknown>,
    simulationResult: SimulationResult,
    unitPricePerTsubo: number
): Promise<string> {
    const customerId = getOptionalString(formPayload["customerId"]);
    const customerInput = buildCustomerInput(formPayload);

    const finalCustomerId = customerId
        ? (
            await updateCustomer(customerId, {
                ...customerInput,
                inPersonCompleted: true,
            })
        ).id
        : (
            await createCustomer({
                ...customerInput,
                inputMode: "inperson",
                webCompleted: false,
                inPersonCompleted: true,
            })
        ).id;

    await prisma.simulation.create({
        data: {
            customerId: finalCustomerId,
            maxLoanAmount: simulationResult.maxLoanAmount,
            wishLoanAmount: simulationResult.wishLoanAmount,
            totalBudget: simulationResult.totalBudget,
            buildingBudget: simulationResult.buildingBudget,
            estimatedTsubo: simulationResult.estimatedTsubo,
            estimatedSquareMeters: simulationResult.estimatedSquareMeters,
            interestRate: simulationResult.repaymentInterestRate,
            dtiRatio: simulationResult.dtiRatio,
            unitPricePerTsubo: Math.round(unitPricePerTsubo),
        },
    });

    return finalCustomerId;
}

export function buildSimulationData(
    normalizedInput: SimulationInput,
    result: SimulationResult
): SimulationData {
    return {
        customerName: normalizedInput.name ?? "",
        email: normalizedInput.email ?? "",
        age: normalizedInput.age,
        ownIncome: normalizedInput.ownIncome,
        spouseIncome: normalizedInput.spouseIncome || 0,
        ownLoanPayment: normalizedInput.ownLoanPayment,
        spouseLoanPayment: normalizedInput.spouseLoanPayment || 0,
        downPayment: normalizedInput.downPayment,
        wishMonthlyPayment: normalizedInput.wishMonthlyPayment,
        wishPaymentYears: normalizedInput.wishPaymentYears,
        hasSpouse: normalizedInput.hasSpouse || false,
        usesBonus: normalizedInput.usesBonus || false,
        bonusPayment: normalizedInput.bonusPayment ?? 0,
        hasLand: normalizedInput.hasLand || false,
        hasExistingBuilding: normalizedInput.hasExistingBuilding || false,
        hasLandBudget: normalizedInput.hasLandBudget || false,
        landBudget: normalizedInput.landBudget ?? 0,
        usesTechnostructure: normalizedInput.usesTechnostructure || false,
        usesAdditionalInsulation: normalizedInput.usesAdditionalInsulation || false,
        result,
    };
}

function buildCustomerInput(formPayload: Record<string, unknown>): CustomerCreateInput {
    const name = getRequiredString(formPayload["name"], "name");
    const hasSpouse = getOptionalBoolean(formPayload["hasSpouse"]);
    const usesBonus = getOptionalBoolean(formPayload["usesBonus"]);
    const hasLand = getOptionalBoolean(formPayload["hasLand"]);
    const hasLandBudget = getOptionalBoolean(formPayload["hasLandBudget"]);
    const usesAdditionalInsulation = getOptionalBoolean(formPayload["usesAdditionalInsulation"]);
    const baseAddress = getOptionalString(formPayload["baseAddress"]) ?? getOptionalString(formPayload["address"]);
    const detailAddress = getOptionalString(formPayload["detailAddress"]);
    const bonusPaymentValue = (() => {
        const parsed = getOptionalInteger(formPayload["bonusPayment"]);
        if (usesBonus === false) {
            return 0;
        }
        return parsed ?? 0;
    })();

    return {
        name,
        email: getOptionalString(formPayload["email"]),
        phone: getOptionalString(formPayload["phone"]),
        postalCode: getOptionalString(formPayload["postalCode"]),
        baseAddress,
        detailAddress,
        age: getOptionalInteger(formPayload["age"]),
        hasSpouse,
        ownIncome: getOptionalInteger(formPayload["ownIncome"]),
        spouseIncome: hasSpouse ? getOptionalInteger(formPayload["spouseIncome"]) : undefined,
        ownLoanPayment: getOptionalInteger(formPayload["ownLoanPayment"]),
        spouseLoanPayment: hasSpouse ? getOptionalInteger(formPayload["spouseLoanPayment"]) : undefined,
        spouseAge: hasSpouse ? getOptionalInteger(formPayload["spouseAge"]) : undefined,
        downPayment: getOptionalInteger(formPayload["downPayment"]),
        wishMonthlyPayment: getOptionalInteger(formPayload["wishMonthlyPayment"]),
        wishPaymentYears: getOptionalInteger(formPayload["wishPaymentYears"]),
        usesBonus,
        bonusPayment: bonusPaymentValue,
        hasLand,
        hasExistingBuilding: hasLand ? getOptionalBoolean(formPayload["hasExistingBuilding"]) : undefined,
        hasLandBudget,
        landBudget: hasLand ? undefined : getOptionalInteger(formPayload["landBudget"]),
        usesTechnostructure: getOptionalBoolean(formPayload["usesTechnostructure"]),
        usesAdditionalInsulation,
        spouseName: getOptionalString(formPayload["spouseName"]),
    };
}

function getOptionalString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function getRequiredString(value: unknown, fieldName: string): string {
    const stringValue = getOptionalString(value);
    if (!stringValue) {
        throw new Error(`${fieldName} is required`);
    }
    return stringValue;
}

function getOptionalInteger(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.round(value);
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
    }
    return undefined;
}

function getOptionalBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

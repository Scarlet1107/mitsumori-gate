import { describe, expect, it } from "vitest";

import {
    calculateSimulation,
    createSimulationConfig,
    type SimulationConfig,
} from "@/lib/simulation";
import type { SimulationInput } from "@/lib/simulation";

const config: SimulationConfig = createSimulationConfig();

describe("calculateSimulation", () => {
    it("computes loan capacity, wish loan, and footprint correctly", () => {
        const input: SimulationInput = {
            age: 35,
            postalCode: "1234567",
            incomeHusband: 6_000_000,
            incomeWife: 4_000_000,
            otherLoanAnnualRepay: 200_000,
            headMoney: 5_000_000,
            hasLand: false,
            wishMonthly: 150_000,
            termYearsSelected: 35,
            bonusEnabled: true,
            bonusPerPayment: 300_000,
        };

        const result = calculateSimulation(input, config);

        expect(result.termYearsEffective).toBe(35);
        expect(result.maxTermByAge).toBe(45);
        expect(result.termMonths).toBe(420);
        expect(result.monthlyRate).toBeCloseTo(0.00125, 5);

        expect(result.householdAnnualIncome).toBe(10_000_000);
        expect(result.maxAnnualDebt).toBe(2_500_000);
        expect(result.availableAnnualForThisLoan).toBe(2_300_000);
        expect(result.availableMonthlyForThisLoan).toBeCloseTo(191_666.6667, 3);

        expect(result.maxLoan).toBeCloseTo(62_598_434.74, 2);
        expect(result.wishLoan).toBeCloseTo(65_320_105.81, 2);
        expect(result.ratio).toBe(1);

        expect(result.budgetForBuilding).toBeCloseTo(70_320_105.81, 2);
        expect(result.tsubo).toBeCloseTo(8.79, 2);
        expect(result.squareMeters).toBeCloseTo(29.057, 3);

        expect(result.bonusAnnual).toBe(600_000);
        expect(result.bonusMonthly).toBe(50_000);
        expect(result.wishMonthlyTotal).toBe(200_000);
    });

    it("handles zero income scenarios gracefully", () => {
        const input: SimulationInput = {
            age: 40,
            postalCode: "7654321",
            incomeHusband: 0,
            incomeWife: 0,
            otherLoanAnnualRepay: 0,
            headMoney: 0,
            hasLand: true,
            wishMonthly: 0,
            termYearsSelected: 30,
            bonusEnabled: false,
            bonusPerPayment: 0,
        };

        const result = calculateSimulation(input, config);

        expect(result.maxLoan).toBe(0);
        expect(result.wishLoan).toBe(0);
        expect(result.ratio).toBe(0);
        expect(result.budgetForBuilding).toBe(0);
        expect(result.tsubo).toBe(0);
        expect(result.squareMeters).toBe(0);
        expect(result.bonusAnnual).toBe(0);
        expect(result.bonusMonthly).toBe(0);
        expect(result.wishMonthlyTotal).toBe(0);
    });
});

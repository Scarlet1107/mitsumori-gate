import { describe, expect, it } from "vitest";

import { simulationInputSchema } from "@/lib/simulation/schema";

describe("simulationInputSchema", () => {
    const base = {
        age: 30,
        postalCode: "123-4567",
        incomeHusband: 5_000_000,
        incomeWife: 4_000_000,
        otherLoanAnnualRepay: 100_000,
        headMoney: 2_000_000,
        hasLand: false,
        wishMonthly: 120_000,
        termYearsSelected: 35,
        bonusEnabled: false,
    };

    it("normalizes postal code and bonus fields", () => {
        const parsed = simulationInputSchema.parse({
            ...base,
            bonusPerPayment: null,
        });

        expect(parsed.postalCode).toBe("1234567");
        expect(parsed.bonusPerPayment).toBe(0);
    });

    it("requires bonusPerPayment when bonus is enabled", () => {
        const result = simulationInputSchema.safeParse({
            ...base,
            bonusEnabled: true,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.path).toEqual(["bonusPerPayment"]);
        }
    });

    it("rejects invalid postal code", () => {
        const result = simulationInputSchema.safeParse({
            ...base,
            postalCode: "12-345",
        });

        expect(result.success).toBe(false);
    });
});

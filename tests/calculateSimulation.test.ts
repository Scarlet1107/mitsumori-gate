import { describe, expect, it } from "@jest/globals";

import { calculateSimulation, type SimulationConfig, type SimulationInput } from "@/lib/simulation/engine";

type ExpectedResult = {
    [Key in keyof ReturnType<typeof calculateSimulation>]: ReturnType<typeof calculateSimulation>[Key];
};

const expectResultClose = (actual: ReturnType<typeof calculateSimulation>, expected: ExpectedResult) => {
    const keys = Object.keys(expected) as Array<keyof ExpectedResult>;
    for (const key of keys) {
        const actualValue = actual[key];
        const expectedValue = expected[key];
        if (typeof expectedValue === "number") {
            expect(actualValue as number).toBeCloseTo(expectedValue, 6);
        } else {
            expect(actualValue).toEqual(expectedValue);
        }
    }
};

describe("calculateSimulation", () => {
    it("夫婦、テクノストラクチャー、断熱あり", () => {
        const input: SimulationInput = {
            name: "Test",
            email: "test@example.com",
            age: 35,
            spouseAge: 25,
            hasSpouse: true,
            ownIncome: 600,
            spouseIncome: 400,
            ownLoanPayment: 0,
            spouseLoanPayment: 0,
            downPayment: 500,
            wishMonthlyPayment: 20,
            wishPaymentYears: 40,
            usesBonus: false,
            bonusPayment: 0,
            hasLand: true,
            hasExistingBuilding: true,
            landBudget: 0,
            usesTechnostructure: true,
            usesAdditionalInsulation: true,
        };

        const config: SimulationConfig = {
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            dtiRatio: 35,
            unitPriceTiers: [{ maxTsubo: 999, unitPrice: 70 }],
            technostructureUnitPriceIncrease: 4.8,
            insulationUnitPriceIncrease: 2.5,
            demolitionCost: 500,
            defaultLandCost: 1000,
            miscCost: 300,
        };

        const result = calculateSimulation(input, config);

        expectResultClose(result, {
            maxLoanAmount: 8637.097362482598,
            wishLoanAmount: 8213.206119275312,
            totalBudget: 8713.206119275312,
            buildingBudget: 7913.206119275312,
            landCost: 0,
            demolitionCost: 500,
            miscCost: 300,
            estimatedTsubo: 102.3700662260713,
            estimatedSquareMeters: 338.4134293791531,
            unitPricePerTsubo: 70,
            monthlyPaymentCapacity: 29.166666666666668,
            dtiRatio: 24,
            loanRatio: 0.9509220256045087,
            totalPayment: 9600,
            totalInterest: 1386.7938807246883,
            maxLoanTotalPayment: 15750,
            maxLoanTotalInterest: 7112.902637517402,
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            loanTerm: 40,
            maxTermYears: 45,
            warnings: { exceedsMaxLoan: false, exceedsMaxTerm: false },
        });
    });

    it("夫婦、テクノストラクチャーあり", () => {
        const input: SimulationInput = {
            name: "Test",
            email: "test@example.com",
            age: 25,
            spouseAge: 30,
            hasSpouse: true,
            ownIncome: 1000,
            spouseIncome: 500,
            ownLoanPayment: 10,
            spouseLoanPayment: 0,
            downPayment: 1000,
            wishMonthlyPayment: 25,
            wishPaymentYears: 35,
            usesBonus: true,
            bonusPayment: 100,
            hasLand: false,
            hasLandBudget: true,
            landBudget: 1500,
            usesTechnostructure: true,
            usesAdditionalInsulation: false,
        };

        const config: SimulationConfig = {
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            dtiRatio: 35,
            unitPriceTiers: [{ maxTsubo: 999, unitPrice: 70 }],
            technostructureUnitPriceIncrease: 5,
            insulationUnitPriceIncrease: 5,
            demolitionCost: 500,
            defaultLandCost: 2000,
            miscCost: 300,
        };

        const result = calculateSimulation(input, config);

        expectResultClose(result, {
            maxLoanAmount: 10482.09897083081,
            wishLoanAmount: 15259.109173419238,
            totalBudget: 16259.109173419238,
            buildingBudget: 14459.109173419238,
            landCost: 1500,
            demolitionCost: 0,
            miscCost: 300,
            estimatedTsubo: 192.7881223122565,
            estimatedSquareMeters: 637.3160829180229,
            unitPricePerTsubo: 70,
            monthlyPaymentCapacity: 33.75,
            dtiRatio: 41.333333333333336,
            loanRatio: 1.4557303089659535,
            totalPayment: 17500,
            totalInterest: 2240.890826580762,
            maxLoanTotalPayment: 20250,
            maxLoanTotalInterest: 9767.90102916919,
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            loanTerm: 35,
            maxTermYears: 50,
            warnings: { exceedsMaxLoan: true, exceedsMaxTerm: false },
        });
    });

    it("独身。テクノストラクチャー断熱なし、貸し出しゼロ金利", () => {
        const input: SimulationInput = {
            name: "Test",
            email: "test@example.com",
            age: 45,
            hasSpouse: false,
            ownIncome: 700,
            spouseIncome: 0,
            ownLoanPayment: 5,
            spouseLoanPayment: 0,
            downPayment: 0,
            wishMonthlyPayment: 15,
            wishPaymentYears: 40,
            usesBonus: false,
            bonusPayment: 0,
            hasLand: false,
            hasLandBudget: false,
            landBudget: 0,
            usesTechnostructure: false,
            usesAdditionalInsulation: false,
        };

        const config: SimulationConfig = {
            screeningInterestRate: 1,
            repaymentInterestRate: 0,
            dtiRatio: 35,
            unitPriceTiers: [{ maxTsubo: 999, unitPrice: 70 }],
            technostructureUnitPriceIncrease: 4.8,
            insulationUnitPriceIncrease: 2.5,
            demolitionCost: 500,
            defaultLandCost: 1000,
            miscCost: 300,
        };

        const result = calculateSimulation(input, config);

        expectResultClose(result, {
            maxLoanAmount: 5461.370067536818,
            wishLoanAmount: 7200,
            totalBudget: 7200,
            buildingBudget: 5900,
            landCost: 1000,
            demolitionCost: 0,
            miscCost: 300,
            estimatedTsubo: 84.28571428571429,
            estimatedSquareMeters: 278.63045000000005,
            unitPricePerTsubo: 70,
            monthlyPaymentCapacity: 15.416666666666664,
            dtiRatio: 34.285714285714285,
            loanRatio: 1.3183505074665882,
            totalPayment: 7200,
            totalInterest: 0,
            maxLoanTotalPayment: 6474.999999999999,
            maxLoanTotalInterest: 1013.6299324631809,
            screeningInterestRate: 1,
            repaymentInterestRate: 0,
            loanTerm: 40,
            maxTermYears: 35,
            warnings: { exceedsMaxLoan: true, exceedsMaxTerm: true },
        });
    });
});

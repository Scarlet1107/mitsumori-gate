import { NextResponse } from "next/server";
import { getCustomerById } from "@/lib/customer-store";
import { getTypedConfigs } from "@/lib/config-store";
import { calculateSimulation, type SimulationInput } from "@/lib/simulation/engine";
import { generatePDFBuffer, type SimulationData } from "@/lib/pdf/simulation-pdf";

const toNumber = (value?: number | null): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    return 0;
};

const toBoolean = (value?: boolean | null, fallback = false): boolean => {
    if (typeof value === "boolean") {
        return value;
    }
    return fallback;
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await getCustomerById(id);

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const config = await getTypedConfigs();

        const simulationInput: SimulationInput = {
            age: toNumber(customer.age),
            spouseAge: toNumber(customer.spouseAge),
            ownIncome: toNumber(customer.ownIncome),
            spouseIncome: toNumber(customer.spouseIncome),
            ownLoanPayment: toNumber(customer.ownLoanPayment),
            spouseLoanPayment: toNumber(customer.spouseLoanPayment),
            downPayment: toNumber(customer.downPayment),
            wishMonthlyPayment: toNumber(customer.wishMonthlyPayment),
            wishPaymentYears: toNumber(customer.wishPaymentYears) || 35,
            usesBonus: toBoolean(customer.usesBonus, false),
            hasLand: toBoolean(customer.hasLand, false),
            hasExistingBuilding: toBoolean(customer.hasExistingBuilding, false),
            hasLandBudget: toBoolean(customer.hasLandBudget, false),
            landBudget: toNumber(customer.landBudget),
            usesTechnostructure: toBoolean(customer.usesTechnostructure, false),
            usesAdditionalInsulation: toBoolean(customer.usesAdditionalInsulation, false),
        };

        const simulationResult = await calculateSimulation(simulationInput, config);

        const simulationData: SimulationData = {
            customerName: customer.name,
            email: customer.email || "",
            age: simulationInput.age,
            ownIncome: simulationInput.ownIncome,
            spouseIncome: simulationInput.spouseIncome,
            ownLoanPayment: simulationInput.ownLoanPayment,
            spouseLoanPayment: simulationInput.spouseLoanPayment,
            downPayment: simulationInput.downPayment,
            wishMonthlyPayment: simulationInput.wishMonthlyPayment,
            wishPaymentYears: simulationInput.wishPaymentYears,
            hasSpouse: toBoolean(customer.hasSpouse, false),
            usesBonus: simulationInput.usesBonus ?? false,
            hasLand: simulationInput.hasLand ?? false,
            usesTechnostructure: simulationInput.usesTechnostructure ?? false,
            usesAdditionalInsulation: simulationInput.usesAdditionalInsulation ?? false,
            phone: customer.phone ?? "",
            postalCode: customer.postalCode ?? "",
            address: customer.detailAddress
                ? `${customer.baseAddress ?? ""}${customer.detailAddress}`
                : (customer.baseAddress ?? ""),
            hasExistingBuilding: simulationInput.hasExistingBuilding ?? false,
            hasLandBudget: simulationInput.hasLandBudget ?? false,
            landBudget: simulationInput.landBudget ?? 0,
            bonusPayment: simulationInput.bonusPayment ?? 0,
            result: {
                maxLoanAmount: simulationResult.maxLoanAmount,
                wishLoanAmount: simulationResult.wishLoanAmount,
                totalBudget: simulationResult.totalBudget,
                buildingBudget: simulationResult.buildingBudget,
                estimatedTsubo: simulationResult.estimatedTsubo,
                estimatedSquareMeters: simulationResult.estimatedSquareMeters,
                landCost: simulationResult.landCost,
                demolitionCost: simulationResult.demolitionCost,
                miscCost: simulationResult.miscCost,
                monthlyPaymentCapacity: simulationResult.monthlyPaymentCapacity,
                dtiRatio: simulationResult.dtiRatio,
                loanRatio: simulationResult.loanRatio,
                totalPayment: simulationResult.totalPayment,
                totalInterest: simulationResult.totalInterest,
                screeningInterestRate: simulationResult.screeningInterestRate,
                repaymentInterestRate: simulationResult.repaymentInterestRate,
                loanTerm: simulationResult.loanTerm,
            }
        };

        const pdfBuffer = await generatePDFBuffer(simulationData);
        const rawFileName = `simulation_${customer.name.replace(/\s+/g, "")}.pdf`;
        const encodedFileName = encodeURIComponent(rawFileName);
        // ASCII フォールバックと UTF-8 の両方を付与して日本語名でもヘッダーが壊れないようにする
        const contentDisposition = `attachment; filename="simulation.pdf"; filename*=UTF-8''${encodedFileName}`;

        const response = new NextResponse(pdfBuffer as unknown as ReadableStream<Uint8Array>, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": contentDisposition,
            }
        });
        return response;
    } catch (error) {
        console.error("GET /api/customers/[id]/pdf failed:", error);
        return NextResponse.json(
            { error: "PDFの生成に失敗しました" },
            { status: 500 }
        );
    }
}

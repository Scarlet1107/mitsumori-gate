import { NextResponse } from "next/server";
import { getCustomerById } from "@/lib/customer-store";
import { getTypedConfigs } from "@/lib/config-store";
import { calculateSimulation, type SimulationInput } from "@/lib/simulation/engine";
import { generatePDFBuffer, type SimulationData } from "@/lib/pdf/simulation-pdf";
import { buildSimulationData } from "@/app/api/simulation/shared";

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
            name: customer.name,
            email: customer.email ?? "",
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
            bonusPayment: toNumber(customer.bonusPayment),
            hasLand: toBoolean(customer.hasLand, false),
            hasExistingBuilding: toBoolean(customer.hasExistingBuilding, false),
            hasLandBudget: toBoolean(customer.hasLandBudget, false),
            landBudget: toNumber(customer.landBudget),
            usesTechnostructure: toBoolean(customer.usesTechnostructure, false),
            usesAdditionalInsulation: toBoolean(customer.usesAdditionalInsulation, false),
        };

        const simulationResult = await calculateSimulation(simulationInput, config);

        const baseSimulationData = buildSimulationData(simulationInput, simulationResult);
        const simulationData: SimulationData = {
            ...baseSimulationData,
            phone: customer.phone ?? "",
            postalCode: customer.postalCode ?? "",
            address: customer.detailAddress
                ? `${customer.baseAddress ?? ""}${customer.detailAddress}`
                : (customer.baseAddress ?? ""),
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

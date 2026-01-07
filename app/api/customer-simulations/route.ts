import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerId, ...simulationData } = body;

        const simulation = await prisma.simulation.create({
            data: {
                customerId,
                maxLoanAmount: simulationData.maxLoanAmount,
                wishLoanAmount: simulationData.wishLoanAmount,
                totalBudget: simulationData.totalBudget,
                buildingBudget: simulationData.buildingBudget,
                estimatedTsubo: simulationData.estimatedTsubo,
                estimatedSquareMeters: simulationData.estimatedSquareMeters,
                interestRate: simulationData.repaymentInterestRate ?? simulationData.interestRate,
                dtiRatio: simulationData.dtiRatio,
                unitPricePerTsubo: Number.isFinite(simulationData.unitPricePerTsubo)
                    ? Math.round(simulationData.unitPricePerTsubo)
                    : null,
            },
        });

        return NextResponse.json({
            id: simulation.id,
            createdAt: simulation.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("POST /api/customer-simulations failed:", error);
        return NextResponse.json(
            { error: "シミュレーション結果の保存に失敗しました" },
            { status: 500 }
        );
    }
}

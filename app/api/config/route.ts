import { NextResponse } from "next/server";
import { getTypedConfigs } from "@/lib/config-store";

export async function GET() {
    try {
        const config = await getTypedConfigs();
        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to get config:", error);
        // エラーの場合はデフォルト値を返す
        return NextResponse.json({
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            dtiRatio: 35,
            unitPriceTiers: [
                { maxTsubo: 20, unitPrice: 105 },
                { maxTsubo: 25, unitPrice: 100 },
                { maxTsubo: 30, unitPrice: 90 },
                { maxTsubo: 35, unitPrice: 87 },
                { maxTsubo: 40, unitPrice: 84 },
                { maxTsubo: 45, unitPrice: 81 },
                { maxTsubo: 50, unitPrice: 78 },
                { maxTsubo: 55, unitPrice: 75 },
            ],
            technostructureUnitPriceIncrease: 4.5,
            insulationUnitPriceIncrease: 3,
            demolitionCost: 250,
            defaultLandCost: 1000,
            miscCost: 100,
        });
    }
}

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
            unitPricePerTsubo: 82,
            technostructureUnitPriceIncrease: 4.8,
            insulationUnitPriceIncrease: 3,
            demolitionCost: 250,
            defaultLandCost: 1000,
            miscCost: 100,
        });
    }
}

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
            annualInterestRate: 1.5,
            dtiRatio: 35,
            unitPricePerTsubo: 70,
            demolitionCost: 250,
            defaultLandCost: 1000,
            miscCost: 100,
        });
    }
}

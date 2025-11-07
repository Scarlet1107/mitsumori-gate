"use client";

import { Card } from "@/components/ui/card";

type FloorPlanVariant = "initial" | "adjusted";

interface InPersonFormFloorPlanDisplayProps {
    variant: FloorPlanVariant;
}

const variantText: Record<FloorPlanVariant, { title: string; description: string }> = {
    initial: {
        title: "希望条件で作れる図面のイメージ",
        description: "希望条件をもとにした間取りイメージを準備中です。対面相談時に担当者が最新プランをご提示します。"
    },
    adjusted: {
        title: "調整後の図面イメージ",
        description: "条件調整後のプランを反映しています。詳細は担当者にご相談ください。"
    }
};

export function InPersonFormFloorPlanDisplay({ variant }: InPersonFormFloorPlanDisplayProps) {
    const content = variantText[variant];
    return (
        <Card className="p-6 space-y-4 text-center bg-gray-50 border-dashed border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{content.title}</h3>
            <p className="text-sm text-gray-600">{content.description}</p>
            <div className="h-40 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400">
                図面プレビュー（準備中）
            </div>
        </Card>
    );
}

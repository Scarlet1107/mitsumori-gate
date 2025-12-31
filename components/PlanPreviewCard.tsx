import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatManWithOku } from "@/lib/format";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type PlanPreview = {
    id: string;
    title: string;
    budgetMin: number;
    budgetMax?: number;
    description: string;
    features: string[];
    imageSrc: string;
    imageAlt: string;
};

const PLAN_PREVIEWS: PlanPreview[] = [
    {
        id: "compact",
        title: "コンパクトプラン",
        budgetMin: 0,
        budgetMax: 2000,
        description: "必要な機能をぎゅっと集めた効率重視の住まい。",
        features: ["LDK中心の動線", "収納をまとめた間取り", "ワンフロア想定"],
        imageSrc: "/plan-previews/plan-compact.svg",
        imageAlt: "コンパクトプランの間取りイメージ",
    },
    {
        id: "standard",
        title: "スタンダードプラン",
        budgetMin: 2000,
        budgetMax: 3000,
        description: "家族の暮らしをバランスよく支える王道プラン。",
        features: ["LDK + 2室", "水回りを集約", "小さな書斎スペース"],
        imageSrc: "/plan-previews/plan-standard.svg",
        imageAlt: "スタンダードプランの間取りイメージ",
    },
    {
        id: "spacious",
        title: "ゆとりプラン",
        budgetMin: 3000,
        budgetMax: 4000,
        description: "趣味や在宅ワークにも対応できる余白のある構成。",
        features: ["LDK拡張", "個室2〜3室", "多目的スペース"],
        imageSrc: "/plan-previews/plan-spacious.svg",
        imageAlt: "ゆとりプランの間取りイメージ",
    },
    {
        id: "premium",
        title: "プレミアムプラン",
        budgetMin: 4000,
        description: "開放感と上質さを両立した贅沢プラン。",
        features: ["広めのLDK", "趣味室 + 主寝室", "回遊動線"],
        imageSrc: "/plan-previews/plan-premium.svg",
        imageAlt: "プレミアムプランの間取りイメージ",
    },
];

const pickPlanPreview = (buildingBudget: number) => {
    for (const preview of PLAN_PREVIEWS) {
        if (
            buildingBudget >= preview.budgetMin &&
            (preview.budgetMax === undefined || buildingBudget < preview.budgetMax)
        ) {
            return preview;
        }
    }
    return PLAN_PREVIEWS[PLAN_PREVIEWS.length - 1];
};

export function PlanPreviewCard({
    buildingBudget,
    className,
}: {
    buildingBudget: number;
    className?: string;
}) {
    const preview = pickPlanPreview(buildingBudget);

    return (
        <Card className={`p-6 space-y-4 ${className ?? ""}`.trim()}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">{preview.title}</h3>
                <span className="text-sm text-gray-500">
                    建築予算目安: {formatManWithOku(buildingBudget)}
                </span>
            </div>
            <p className="text-sm text-gray-600">{preview.description}</p>
            <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <Dialog>
                        <DialogTrigger>
                            <Image
                                src={preview.imageSrc}
                                alt={preview.imageAlt}
                                width={800}
                                height={520}
                                className="h-auto w-full rounded-lg"
                                priority
                            />
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    <div>
                                        <p className="text-lg font-semibold mb-2">{preview.title}</p>
                                        <p>{preview.description}</p>
                                    </div>
                                </DialogTitle>
                                <DialogDescription>
                                    <Image
                                        src={preview.imageSrc}
                                        alt={preview.imageAlt}
                                        width={800}
                                        height={520}
                                        className="h-auto w-full rounded-lg"
                                        priority
                                    />
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                        この予算帯のイメージ
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {preview.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-gray-500">
                        ※ 実際の間取りは土地条件や工法により調整されます
                    </p>
                </div>
            </div>
        </Card>
    );
}

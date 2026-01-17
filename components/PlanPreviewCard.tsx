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
    tsuboMax: number;
    description: string;
    features: string[];
    images: {
        src: string;
        alt: string;
        label: string;
    }[];
};

const PLAN_PREVIEWS: PlanPreview[] = [
    {
        id: "tsubo-20",
        title: "20坪以下プラン",
        tsuboMax: 20,
        description: "必要な機能をぎゅっと集めた効率重視の住まい。",
        features: ["LDK中心の動線", "収納をまとめた間取り", "ワンフロア想定"],
        images: [
            { src: "/plan-previews/tsubo-20-1f.svg", alt: "20坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-20-2f.svg", alt: "20坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-20-exterior.svg", alt: "20坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-25",
        title: "25坪以下プラン",
        tsuboMax: 25,
        description: "家族の暮らしをバランスよく支える王道プラン。",
        features: ["LDK + 2室", "水回りを集約", "小さな書斎スペース"],
        images: [
            { src: "/plan-previews/tsubo-25-1f.svg", alt: "25坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-25-2f.svg", alt: "25坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-25-exterior.svg", alt: "25坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-30",
        title: "30坪以下プラン",
        tsuboMax: 30,
        description: "趣味や在宅ワークにも対応できる余白のある構成。",
        features: ["LDK拡張", "個室2〜3室", "多目的スペース"],
        images: [
            { src: "/plan-previews/tsubo-30-1f.svg", alt: "30坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-30-2f.svg", alt: "30坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-30-exterior.svg", alt: "30坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-35",
        title: "35坪以下プラン",
        tsuboMax: 35,
        description: "開放感と上質さを両立した贅沢プラン。",
        features: ["広めのLDK", "趣味室 + 主寝室", "回遊動線"],
        images: [
            { src: "/plan-previews/tsubo-35-1f.svg", alt: "35坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-35-2f.svg", alt: "35坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-35-exterior.svg", alt: "35坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-40",
        title: "40坪以下プラン",
        tsuboMax: 40,
        description: "ゆとりあるLDKと動線で家族時間を楽しめる構成。",
        features: ["LDK + 3室", "家事動線を最適化", "収納計画強化"],
        images: [
            { src: "/plan-previews/tsubo-40-1f.svg", alt: "40坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-40-2f.svg", alt: "40坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-40-exterior.svg", alt: "40坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-45",
        title: "45坪以下プラン",
        tsuboMax: 45,
        description: "家族構成の変化にも対応できる余裕を確保。",
        features: ["個室3〜4室", "回遊動線", "多目的ホール"],
        images: [
            { src: "/plan-previews/tsubo-45-1f.svg", alt: "45坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-45-2f.svg", alt: "45坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-45-exterior.svg", alt: "45坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-50",
        title: "50坪以下プラン",
        tsuboMax: 50,
        description: "趣味や来客にも対応できる上質な広さ。",
        features: ["広めのLDK", "趣味室 + 客間", "収納を分散配置"],
        images: [
            { src: "/plan-previews/tsubo-50-1f.svg", alt: "50坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-50-2f.svg", alt: "50坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-50-exterior.svg", alt: "50坪以下 外観イメージ", label: "外観CG" },
        ],
    },
    {
        id: "tsubo-55",
        title: "55坪以下プラン",
        tsuboMax: 55,
        description: "開放感と機能性を両立したハイグレード構成。",
        features: ["大空間LDK", "ファミリークローク", "回遊動線 + 中庭"],
        images: [
            { src: "/plan-previews/tsubo-55-1f.svg", alt: "55坪以下 1F 平面図", label: "1F 平面図" },
            { src: "/plan-previews/tsubo-55-2f.svg", alt: "55坪以下 2F 平面図", label: "2F 平面図" },
            { src: "/plan-previews/tsubo-55-exterior.svg", alt: "55坪以下 外観イメージ", label: "外観CG" },
        ],
    },
];

const pickPlanPreview = (estimatedTsubo: number) => {
    for (const preview of PLAN_PREVIEWS) {
        if (estimatedTsubo <= preview.tsuboMax) {
            return preview;
        }
    }
    return PLAN_PREVIEWS[PLAN_PREVIEWS.length - 1];
};

export function PlanPreviewCard({
    buildingBudget,
    estimatedTsubo,
    className,
}: {
    buildingBudget: number;
    estimatedTsubo: number;
    className?: string;
}) {
    const preview = pickPlanPreview(estimatedTsubo);

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
                <div className="flex flex-col gap-3">
                    {preview.images.map((image) => (
                        <div key={image.src} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <Dialog>
                                <DialogTrigger className="w-full">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        width={520}
                                        height={360}
                                        className="h-auto w-full rounded-lg"
                                        priority
                                    />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            <div>
                                                <p className="text-lg font-semibold mb-2">{preview.title}</p>
                                                <p>{image.label}</p>
                                            </div>
                                        </DialogTitle>
                                        <DialogDescription>
                                            <Image
                                                src={image.src}
                                                alt={image.alt}
                                                width={800}
                                                height={520}
                                                className="h-auto w-full rounded-lg"
                                                priority
                                            />
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                            <p className="mt-2 text-xs font-semibold text-gray-600">{image.label}</p>
                        </div>
                    ))}
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

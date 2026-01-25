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
    tsuboMin?: number;
    tsuboMax?: number;
    images: {
        src: string;
        alt: string;
        label: string;
    }[];
};

const PLAN_PREVIEWS: PlanPreview[] = [
    {
        id: "tsubo-20-25",
        title: "20〜25坪プラン",
        tsuboMax: 25,
        images: [
            {
                src: "/plan-previews/tsubo-20-25.jpg",
                alt: "20〜25坪 プランイメージ",
                label: "プランイメージ",
            },
        ],
    },
    {
        id: "tsubo-26-30",
        title: "26〜30坪プラン",
        tsuboMax: 30,
        images: [
            {
                src: "/plan-previews/tsubo-26-30.jpg",
                alt: "26〜30坪 プランイメージ",
                label: "プランイメージ",
            },
        ],
    },
    {
        id: "tsubo-31-34",
        title: "31〜34坪プラン",
        tsuboMax: 34,
        images: [
            {
                src: "/plan-previews/tsubo-31-34.jpg",
                alt: "31〜34坪 プランイメージ",
                label: "プランイメージ",
            },
        ],
    },
    {
        id: "tsubo-35-36",
        title: "35〜36坪プラン",
        tsuboMax: 35.99,
        images: [
            {
                src: "/plan-previews/tsubo-35-36.jpg",
                alt: "35〜36坪 プランイメージ",
                label: "プランイメージ",
            },
        ],
    },
    {
        id: "tsubo-36",
        title: "36坪プラン",
        tsuboMin: 36,
        tsuboMax: 37.99,
        images: [
            {
                src: "/plan-previews/tsubo-36-2.jpg",
                alt: "36坪 プランイメージ パターン1",
                label: "パターン1",
            },
            {
                src: "/plan-previews/tsubo-36-3.jpg",
                alt: "36坪 プランイメージ パターン2",
                label: "パターン2",
            },
        ],
    },
    {
        id: "tsubo-38",
        title: "38坪プラン",
        tsuboMin: 38,
        images: [
            {
                src: "/plan-previews/tsubo-38-0.jpg",
                alt: "38坪 プランイメージ パターン1",
                label: "パターン1",
            },
            {
                src: "/plan-previews/tsubo-38-1.jpg",
                alt: "38坪 プランイメージ パターン2",
                label: "パターン2",
            },
        ],
    },
];

const pickPlanPreview = (estimatedTsubo: number) => {
    for (const preview of PLAN_PREVIEWS) {
        const meetsMin = preview.tsuboMin === undefined || estimatedTsubo >= preview.tsuboMin;
        const meetsMax = preview.tsuboMax === undefined || estimatedTsubo <= preview.tsuboMax;
        if (meetsMin && meetsMax) {
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
            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    {preview.images.map((image) => (
                        <div
                            key={image.src}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                        >
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
                                <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            <div>
                                                <p className="text-lg font-semibold mb-2">
                                                    {preview.title}
                                                </p>
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
                            <p className="mt-2 text-xs font-semibold text-gray-600">
                                {image.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

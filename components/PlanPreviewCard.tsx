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
        images: [
            {
                src: "/plan-previews/tsubo-20-1f.svg",
                alt: "20坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-20-2f.svg",
                alt: "20坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-20-exterior.svg",
                alt: "20坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-25",
        title: "25坪以下プラン",
        tsuboMax: 25,
        images: [
            {
                src: "/plan-previews/tsubo-25-1f.svg",
                alt: "25坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-25-2f.svg",
                alt: "25坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-25-exterior.svg",
                alt: "25坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-30",
        title: "30坪以下プラン",
        tsuboMax: 30,
        images: [
            {
                src: "/plan-previews/tsubo-30-1f.svg",
                alt: "30坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-30-2f.svg",
                alt: "30坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-30-exterior.svg",
                alt: "30坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-35",
        title: "35坪以下プラン",
        tsuboMax: 35,
        images: [
            {
                src: "/plan-previews/tsubo-35-1f.svg",
                alt: "35坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-35-2f.svg",
                alt: "35坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-35-exterior.svg",
                alt: "35坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-40",
        title: "40坪以下プラン",
        tsuboMax: 40,
        images: [
            {
                src: "/plan-previews/tsubo-40-1f.svg",
                alt: "40坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-40-2f.svg",
                alt: "40坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-40-exterior.svg",
                alt: "40坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-45",
        title: "45坪以下プラン",
        tsuboMax: 45,
        images: [
            {
                src: "/plan-previews/tsubo-45-1f.svg",
                alt: "45坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-45-2f.svg",
                alt: "45坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-45-exterior.svg",
                alt: "45坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-50",
        title: "50坪以下プラン",
        tsuboMax: 50,
        images: [
            {
                src: "/plan-previews/tsubo-50-1f.svg",
                alt: "50坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-50-2f.svg",
                alt: "50坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-50-exterior.svg",
                alt: "50坪以下 外観イメージ",
                label: "外観CG",
            },
        ],
    },
    {
        id: "tsubo-55",
        title: "55坪以下プラン",
        tsuboMax: 55,
        images: [
            {
                src: "/plan-previews/tsubo-55-1f.svg",
                alt: "55坪以下 1F 平面図",
                label: "1F 平面図",
            },
            {
                src: "/plan-previews/tsubo-55-2f.svg",
                alt: "55坪以下 2F 平面図",
                label: "2F 平面図",
            },
            {
                src: "/plan-previews/tsubo-55-exterior.svg",
                alt: "55坪以下 外観イメージ",
                label: "外観CG",
            },
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
                                <DialogContent>
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

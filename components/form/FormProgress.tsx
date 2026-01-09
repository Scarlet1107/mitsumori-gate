/**
 * フォーム進捗表示コンポーネント
 */

import { memo, ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface FormProgressProps {
    progress: number;
    className?: string;
    showStepInfo?: boolean;
    stepLabel?: string;
    headerAction?: ReactNode;
}

/**
 * フォーム進捗表示コンポーネント
 * 
 * @param progress - 進捗パーセンテージ（0-100）
 * @param className - 追加のCSSクラス
 * @param showStepInfo - ステップ情報の表示（デフォルト: true）
 * @param stepLabel - 画面右側に表示するステップ表記
 */
export const FormProgress = memo<FormProgressProps>(({
    progress,
    className = "",
    showStepInfo = true,
    stepLabel,
    headerAction,
}) => {
    const formTypeText = "家づくりかんたんシミュレーション";

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="space-y-2">
                    <Image
                        src={"/logo1.png"}
                        alt="Logo"
                        width={200}
                        height={33.6}
                        draggable={false}
                        className="pointer-events-none select-none"
                    />
                    <span className="font-medium tracking-wide text-gray-700">{formTypeText}</span>

                </div>
                {headerAction && (
                    <div className="shrink-0">
                        {headerAction}
                    </div>
                )}
            </div>
            <Progress
                value={progress}
                className="w-full h-2"
                aria-label={`進捗: ${progress.toFixed(0)}%完了`}
            />
            <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-right text-muted-foreground">
                    {progress.toFixed(0)}% 完了
                </div>
                {showStepInfo && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {stepLabel && (
                            <Badge variant="secondary" className="px-3 py-1.5 font-semibold">
                                {stepLabel}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

FormProgress.displayName = "FormProgress";

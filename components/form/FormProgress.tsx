/**
 * フォーム進捗表示コンポーネント
 */

import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface FormProgressProps {
    progress: number;
    className?: string;
    showStepInfo?: boolean;
    stepLabel?: string;
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
}) => {
    const formTypeText = "家づくりかんたんシミュレーション";

    return (
        <div className={`space-y-2 ${className}`}>
            <Image
                src={"/logo1.png"}
                alt="Logo"
                width={200}
                height={33.6}
                draggable={false}
                className="pointer-events-none select-none"
            />
            {showStepInfo && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{formTypeText}</span>
                    {stepLabel && <span>{stepLabel}</span>}
                </div>
            )}
            <Progress
                value={progress}
                className="w-full h-2"
                aria-label={`進捗: ${progress.toFixed(0)}%完了`}
            />
            <div className="text-xs text-right text-muted-foreground">
                {progress.toFixed(0)}% 完了
            </div>
        </div>
    );
});

FormProgress.displayName = "FormProgress";

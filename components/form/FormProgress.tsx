/**
 * フォーム進捗表示コンポーネント
 */

import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface FormProgressProps {
    progress: number;
    currentStepIndex: number;
    totalSteps: number;
    formType: "web" | "inperson";
    className?: string;
    showStepInfo?: boolean;
}

/**
 * フォーム進捗表示コンポーネント
 * 
 * @param progress - 進捗パーセンテージ（0-100）
 * @param currentStepIndex - 現在のステップインデックス（0-based）
 * @param totalSteps - 総ステップ数
 * @param formType - フォームタイプ
 * @param className - 追加のCSSクラス
 * @param showStepInfo - ステップ情報の表示（デフォルト: true）
 */
export const FormProgress = memo<FormProgressProps>(({
    progress,
    currentStepIndex,
    totalSteps,
    formType,
    className = "",
    showStepInfo = true,
}) => {
    const formTypeText = formType === "web" ? "簡単家づくりシミュレーション" : "対面相談";

    return (
        <div className={`space-y-2 ${className}`}>
            <Image
                src={"/logo1.png"}
                alt="Logo"
                width={200}
                height={33.6}
                draggable={false}
            // className="pointer-events-none select-none"
            />
            {showStepInfo && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{formTypeText}</span>
                    <span>
                        ステップ {currentStepIndex + 1} / {totalSteps}
                    </span>
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

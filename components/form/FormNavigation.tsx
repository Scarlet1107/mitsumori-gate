/**
 * フォームナビゲーションコンポーネント
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";

interface FormNavigationProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    canProceed?: boolean;
    loading?: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onComplete?: () => void;
    className?: string;

    // カスタマイズオプション
    nextText?: string;
    previousText?: string;
    completeText?: string;
    disabled?: boolean;
    hideNavigation?: boolean;
}

/**
 * フォームナビゲーションコンポーネント
 *
 * @param isFirstStep - 最初のステップかどうか
 * @param isLastStep - 最後のステップかどうか
 * @param loading - ローディング状態
 * @param onPrevious - 前へボタンのハンドラー
 * @param onNext - 次へボタンのハンドラー
 * @param onComplete - 完了ボタンのハンドラー（最後のステップ用）
 * @param className - 追加のCSSクラス
 * @param nextText - 次へボタンのテキスト
 * @param previousText - 前へボタンのテキスト
 * @param completeText - 完了ボタンのテキスト
 * @param disabled - ナビゲーションの無効化
 * @param hideNavigation - ナビゲーションの非表示
 */
export const FormNavigation = memo<FormNavigationProps>(
    ({
        isFirstStep,
        isLastStep,
        canProceed = true,
        loading = false,
        onPrevious,
        onNext,
        onComplete,
        className = "",
        nextText = "次へ",
        previousText = "戻る",
        completeText = "完了",
        disabled = false,
        hideNavigation = false,
    }) => {
        if (hideNavigation) {
            return null;
        }

        const handleComplete = () => {
            if (onComplete) {
                onComplete();
            } else {
                onNext();
            }
        };

        return (
            <div className={`flex justify-between items-center mt-8 ${className}`}>
                {/* 前へボタン */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={onPrevious}
                    disabled={isFirstStep || loading || disabled}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {previousText}
                </Button>

                {/* 次へ/完了ボタン */}
                {isLastStep ? (
                    loading ? (
                        <Button
                            type="button"
                            disabled
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            結果をメールにお送りしています...
                        </Button>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    disabled={disabled || !canProceed}
                                    className="flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    {completeText}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>送信確認</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        今回の結果をメールにてお知らせいたします。よろしいですか？
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>戻る</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleComplete}>
                                        送信する
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )
                ) : (
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={loading || disabled || !canProceed}
                        className="flex items-center gap-2"
                    >
                        {nextText}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        );
    },
);

FormNavigation.displayName = "FormNavigation";

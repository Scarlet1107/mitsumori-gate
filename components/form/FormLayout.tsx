/**
 * フォーム共通レイアウトコンポーネント
 */

import { ReactNode, memo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FormProgress } from "./FormProgress";
import { FormNavigation } from "./FormNavigation";
import { FormAnimationWrapper } from "./FormAnimationWrapper";
import type { NavigationDirection } from "@/lib/form-types";

interface FormLayoutProps {
    // 進捗情報
    progress: number;
    stepLabel?: string;

    // アニメーション
    stepKey: string;
    direction: NavigationDirection;

    // ナビゲーション
    isFirstStep: boolean;
    isLastStep: boolean;
    canProceed?: boolean;
    loading?: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onComplete?: () => void;

    // コンテンツ
    children: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    headerAction?: ReactNode;

    // カスタマイズ
    className?: string;
    cardClassName?: string;
    showProgress?: boolean;
    showNavigation?: boolean;
    animationEnabled?: boolean;

    // ナビゲーションカスタマイズ
    nextText?: string;
    previousText?: string;
    completeText?: string;
    navigationDisabled?: boolean;
}

/**
 * フォーム共通レイアウトコンポーネント
 * 
 * 進捗表示、アニメーション、ナビゲーションを統合した
 * フォームの標準レイアウトを提供します。
 */
export const FormLayout = memo<FormLayoutProps>(({
    // 進捗情報
    progress,
    stepLabel,

    // アニメーション
    stepKey,
    direction,

    // ナビゲーション
    isFirstStep,
    isLastStep,
    canProceed = true,
    loading = false,
    onPrevious,
    onNext,
    onComplete,

    // コンテンツ
    children,
    title,
    description,
    headerAction,

    // カスタマイズ
    className = "",
    cardClassName = "",
    showProgress = true,
    showNavigation = true,
    animationEnabled = true,

    // ナビゲーションカスタマイズ
    nextText,
    previousText,
    completeText,
    navigationDisabled = false,
}) => {
    return (
        <div className={`min-h-screen bg-transparent ${className}`}>
            <div className="container mx-auto px-4 py-8">
                <Card className={`max-w-2xl mx-auto ${cardClassName}`}>
                    {showProgress && (
                        <CardHeader className="pb-4">
                            <FormProgress
                                progress={progress}
                                stepLabel={stepLabel}
                                headerAction={headerAction}
                            />
                        </CardHeader>
                    )}

                    <CardContent className="space-y-6">
                        <FormAnimationWrapper
                            stepKey={stepKey}
                            direction={direction}
                            animationEnabled={animationEnabled}
                        >
                            <div className="space-y-6">
                                {/* タイトル・説明エリア */}
                                {(title || description) && (
                                    <div className="space-y-2 text-center">
                                        {title && (
                                            <div className="text-xl font-semibold text-foreground">
                                                {title}
                                            </div>
                                        )}
                                        {description && (
                                            <div className="text-sm text-muted-foreground">
                                                {description}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* メインコンテンツ */}
                                <div className="space-y-4">
                                    {children}
                                </div>
                            </div>
                        </FormAnimationWrapper>

                        {/* ナビゲーション */}
                        {showNavigation && (
                            <FormNavigation
                                isFirstStep={isFirstStep}
                                isLastStep={isLastStep}
                                canProceed={canProceed}
                                loading={loading}
                                onPrevious={onPrevious}
                                onNext={onNext}
                                onComplete={onComplete}
                                nextText={nextText}
                                previousText={previousText}
                                completeText={completeText}
                                disabled={navigationDisabled}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

FormLayout.displayName = "FormLayout";

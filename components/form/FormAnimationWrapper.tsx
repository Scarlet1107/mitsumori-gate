/**
 * フォームステップのアニメーション管理コンポーネント
 */

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, ReactNode, memo } from "react";
import type { NavigationDirection } from "@/lib/form-types";

interface FormAnimationWrapperProps {
    children: ReactNode;
    stepKey: string;
    direction: NavigationDirection;
    animationEnabled?: boolean;
    className?: string;
}

// アニメーション設定
const getAnimationVariants = (direction: NavigationDirection) => ({
    enter: {
        x: direction > 0 ? 20 : -20,
        opacity: 0,
    },
    center: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: direction > 0 ? -20 : 20,
        opacity: 0,
    },
});

const animationTransition = {
    duration: 0.2,
    ease: [0.4, 0.0, 0.2, 1] as const, // easeOutCubic
};

/**
 * フォームステップのアニメーション管理コンポーネント
 * 
 * @param children - アニメーション対象の子要素
 * @param stepKey - 一意なステップキー（通常はstep.id）
 * @param direction - ナビゲーション方向（1: 次へ, -1: 前へ）
 * @param animationEnabled - アニメーションの有効/無効（デフォルト: true）
 * @param className - 追加のCSSクラス
 */
export const FormAnimationWrapper = memo<FormAnimationWrapperProps>(({
    children,
    stepKey,
    direction,
    animationEnabled = true,
    className = "",
}) => {
    const variants = useCallback(() =>
        getAnimationVariants(direction),
        [direction]
    );

    if (!animationEnabled) {
        return (
            <div className={`w-full ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={stepKey}
                custom={direction}
                variants={variants()}
                initial="enter"
                animate="center"
                exit="exit"
                transition={animationTransition}
                className={`w-full ${className}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
});

FormAnimationWrapper.displayName = "FormAnimationWrapper";

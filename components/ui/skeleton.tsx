/**
 * Skeleton - スケルトンローディングコンポーネント
 */

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200",
                className
            )}
            {...props}
        />
    );
}

/**
 * NumberSkeleton - 数字用スケルトン
 */
interface NumberSkeletonProps {
    width?: string;
    height?: string;
    className?: string;
}

export function NumberSkeleton({
    width = "w-20",
    height = "h-6",
    className
}: NumberSkeletonProps) {
    return (
        <Skeleton
            className={cn(
                width,
                height,
                "inline-block",
                className
            )}
        />
    );
}

/**
 * LoadingNumber - 数字またはスケルトンを表示
 */
interface LoadingNumberProps {
    loading?: boolean;
    value: React.ReactNode;
    skeletonWidth?: string;
    skeletonHeight?: string;
    className?: string;
}

export function LoadingNumber({
    loading,
    value,
    skeletonWidth = "w-20",
    skeletonHeight = "h-6",
    className
}: LoadingNumberProps) {
    if (loading) {
        return (
            <NumberSkeleton
                width={skeletonWidth}
                height={skeletonHeight}
                className={className}
            />
        );
    }

    return <>{value}</>;
}

/**
 * スライダーのドラッグ状態を管理するカスタムフック
 */

import { useCallback, useRef, useState } from 'react';

interface UseDragStateOptions {
    onDragEnd?: () => void;
    debounceMs?: number;
}

export function useDragState({ onDragEnd, debounceMs = 500 }: UseDragStateOptions = {}) {
    const [isDragging, setIsDragging] = useState(false);
    const dragEndTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);

        // 既存のタイマーをクリア
        if (dragEndTimerRef.current) {
            clearTimeout(dragEndTimerRef.current);
            dragEndTimerRef.current = null;
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        // ドラッグ終了後、少し待ってからonDragEndを実行
        dragEndTimerRef.current = setTimeout(() => {
            setIsDragging(false);
            onDragEnd?.();
        }, debounceMs);
    }, [onDragEnd, debounceMs]);

    const resetDrag = useCallback(() => {
        setIsDragging(false);
        if (dragEndTimerRef.current) {
            clearTimeout(dragEndTimerRef.current);
            dragEndTimerRef.current = null;
        }
    }, []);

    return {
        isDragging,
        handleDragStart,
        handleDragEnd,
        resetDrag
    };
}

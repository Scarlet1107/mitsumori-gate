/**
 * useSimulationConfig - 試算に必要な設定値を管理するフック
 */

import { useState, useEffect } from 'react';

export interface SimulationConfig {
    annualInterestRate: number;  // 年利率（%）
    dtiRatio: number;           // DTI比率（%）
    unitPricePerTsubo: number;  // 坪単価（万円）
}

interface UseSimulationConfigResult {
    config: SimulationConfig | null;
    loading: boolean;
    error: string | null;
}

// デフォルト設定（フォールバック用）
const DEFAULT_CONFIG: SimulationConfig = {
    annualInterestRate: 1.5,
    dtiRatio: 35,
    unitPricePerTsubo: 70,
};

export function useSimulationConfig(): UseSimulationConfigResult {
    const [config, setConfig] = useState<SimulationConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch('/api/config');

                if (!response.ok) {
                    throw new Error('Failed to fetch config');
                }

                const configData = await response.json();
                setConfig(configData);
                setError(null);

            } catch (err) {
                console.warn('Failed to fetch config, using defaults:', err);
                setConfig(DEFAULT_CONFIG);
                setError('設定の取得に失敗しました。デフォルト値を使用します。');

            } finally {
                setLoading(false);
            }
        }

        fetchConfig();
    }, []);

    return { config, loading, error };
}

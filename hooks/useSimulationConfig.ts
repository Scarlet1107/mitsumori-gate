/**
 * useSimulationConfig - 試算に必要な設定値を管理するフック
 */

import { useState, useEffect } from 'react';
import type { SimulationConfig } from '@/lib/simulation/engine';

interface UseSimulationConfigResult {
    config: SimulationConfig | null;
    loading: boolean;
    error: string | null;
}

// デフォルト設定（フォールバック用）
const DEFAULT_CONFIG: SimulationConfig = {
    screeningInterestRate: 3,
    repaymentInterestRate: 0.8,
    dtiRatio: 35,
    unitPriceTiers: [
        { maxTsubo: 20, unitPrice: 105 },
        { maxTsubo: 25, unitPrice: 100 },
        { maxTsubo: 30, unitPrice: 90 },
        { maxTsubo: 35, unitPrice: 87 },
        { maxTsubo: 40, unitPrice: 84 },
        { maxTsubo: 45, unitPrice: 81 },
        { maxTsubo: 50, unitPrice: 78 },
        { maxTsubo: 55, unitPrice: 75 },
    ],
    technostructureUnitPriceIncrease: 4.5,
    insulationUnitPriceIncrease: 3,
    demolitionCost: 250,
    defaultLandCost: 1000,
    miscCost: 100,
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

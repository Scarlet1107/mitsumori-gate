export interface SimulationConfig {
    annualInterestRate: number;
    maxTermYearsCap: number;
    dtiRatio: number;
    unitPricePerTsubo: number;
}

export const defaultSimulationConfig: SimulationConfig = {
    annualInterestRate: 0.015,
    maxTermYearsCap: 45,
    dtiRatio: 0.25,
    unitPricePerTsubo: 8_000_000,
};

export function createSimulationConfig(
    overrides: Partial<SimulationConfig> = {}
): SimulationConfig {
    return {
        ...defaultSimulationConfig,
        ...overrides,
    };
}

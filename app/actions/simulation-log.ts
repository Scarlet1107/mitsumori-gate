"use server";

import type { SimulationConfig, SimulationInput, SimulationResult } from "@/lib/simulation/engine";

export async function logSimulation(input: SimulationInput, config: SimulationConfig, result: SimulationResult) {
    console.info("[calculateSimulation:client]", { input, config, result });
}

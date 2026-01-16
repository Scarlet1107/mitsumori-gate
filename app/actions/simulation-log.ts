"use server";

import { inspect } from "node:util";
import type { SimulationConfig, SimulationInput, SimulationResult } from "@/lib/simulation/engine";

export async function logSimulation(input: SimulationInput, config: SimulationConfig, result: SimulationResult) {
    console.info(
        "[calculateSimulation:client]",
        inspect({ input, config, result }, { depth: null, colors: false })
    );
}

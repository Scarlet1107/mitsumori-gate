import type { SimulationRecord } from "@/lib/simulation-store";

export async function sendSimulationEmail(
    record: SimulationRecord
): Promise<void> {
    void record;
    // Intentionally left blank. Email delivery hook.
    return Promise.resolve();
}

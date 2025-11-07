// 新システム用のメール送信機能（Resend API使用）

import { sendSimulationResultEmail } from "@/lib/email/resend-client";
import { generatePDFBuffer, type SimulationData } from "@/lib/pdf/simulation-pdf";

export async function sendCustomerEmail(
    customerId: string,
    emailType: "welcome" | "simulation_result",
    simulationData?: SimulationData
): Promise<{ success: boolean; error?: string }> {
    try {
        if (emailType === "simulation_result" && simulationData) {
            const pdfBuffer = await generatePDFBuffer(simulationData);

            return await sendSimulationResultEmail(
                simulationData.email,
                simulationData.customerName,
                pdfBuffer
            );
        }

        console.log(`Email type ${emailType} for customer ${customerId} is not yet implemented`);
        return { success: true };

    } catch (error) {
        console.error(`Failed to send email to customer ${customerId}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

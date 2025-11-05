// 新システム用のメール送信機能（現在は未実装）

export async function sendCustomerEmail(
    customerId: string,
    emailType: "welcome" | "simulation_result"
): Promise<void> {
    // メール送信機能の実装予定箇所
    console.log(`Email would be sent to customer ${customerId} (${emailType})`);
    return Promise.resolve();
}

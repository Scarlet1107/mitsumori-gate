/**
 * Resend API クライアント
 */

import { Resend } from 'resend';

// Resend API キーの確認
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// メール送信の型定義
export interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface SendEmailOptions {
    to: string;
    from: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: EmailAttachment[];
}

/**
 * メール送信のラッパー関数
 */
export async function sendEmail(options: SendEmailOptions) {
    try {
        const result = await resend.emails.send({
            from: options.from,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
            })),
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Email sending failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * シミュレーション結果メール送信
 */
export async function sendSimulationResultEmail(
    recipientEmail: string,
    customerName: string,
    pdfBuffer: Buffer
) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
    const contactPhone = process.env.CONTACT_PHONE || "0120-000-0000";
    const contactEmail = process.env.CONTACT_EMAIL || "info@yourdomain.com";

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>家づくりシミュレーション結果</title>
    </head>
    <body style="font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">家づくりシミュレーション結果</h1>
          <p style="color: #7f8c8d; margin: 10px 0 0 0;">住宅ローンとプランニングシミュレーション</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            <strong>${customerName}</strong> 様
          </p>
          <p style="margin: 0 0 15px 0; color: #34495e;">
            この度は、家づくりシミュレーションをご利用いただき、誠にありがとうございます。
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">シミュレーション結果について</h2>
          <p style="margin: 0 0 10px 0; color: #34495e;">
            添付のPDFファイルに、以下の内容が含まれております：
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #34495e;">
            <li>住宅ローン試算結果</li>
            <li>月々の返済プラン</li>
            <li>建築予算と間取り提案</li>
            <li>資金計画の詳細</li>
          </ul>
        </div>

        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3498db;">
          <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">次のステップ</h3>
          <p style="margin: 0; color: #34495e;">
            より詳細なご相談をご希望の場合は、お気軽にお問い合わせください。<br>
            専門スタッフが、あなたの理想の家づくりをサポートいたします。
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="tel:${contactPhone}" style="background-color: #3498db; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; display: inline-block; margin: 0 10px 10px 0;">
            📞 お電話でのお問い合わせ
          </a>
          <a href="mailto:${contactEmail}" style="background-color: #27ae60; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; display: inline-block; margin: 0 10px 10px 0;">
            ✉️ メールでのお問い合わせ
          </a>
        </div>

        <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; text-align: center;">
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            このメールは自動送信です。ご返信いただいても回答できませんのでご了承ください。<br>
            お問い合わせは上記の連絡先までお願いいたします。
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const textContent = `
${customerName} 様

この度は、家づくりシミュレーションをご利用いただき、誠にありがとうございます。

シミュレーション結果をPDFファイルにまとめて添付いたします。
内容をご確認いただき、ご不明な点がございましたらお気軽にお問い合わせください。

【シミュレーション結果内容】
- 住宅ローン試算結果
- 月々の返済プラン
- 建築予算と間取り提案
- 資金計画の詳細

【お問い合わせ】
電話: ${contactPhone}
メール: ${contactEmail}

---
このメールは自動送信です。
  `;

    return await sendEmail({
        to: recipientEmail,
        from: fromEmail,
        subject: '【家づくりシミュレーション】結果レポートをお送りします',
        html: htmlContent,
        text: textContent,
        attachments: [{
            filename: `家づくりシミュレーション結果_${customerName.replace(/\s+/g, '')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
}

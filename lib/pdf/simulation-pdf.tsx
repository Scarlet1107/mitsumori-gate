/**
 * PDF生成ライブラリ
 * jsPDFを使用してシミュレーション結果をPDFに変換
 */

import jsPDF from "jspdf";
import "jspdf-autotable";
import { addJapaneseFonts, drawJapaneseText, getJapaneseFontFamily } from "./japanese-font";
import { formatManWithOku } from "@/lib/format";

export interface SimulationData {
    // 顧客情報
    customerName: string;
    email: string;
    age: number;

    // 収入情報
    ownIncome: number;
    spouseIncome?: number;
    ownLoanPayment: number;
    spouseLoanPayment?: number;

    // 希望条件
    downPayment: number;
    wishMonthlyPayment: number;
    wishPaymentYears: number;

    // フラグ
    hasSpouse: boolean;
    usesBonus: boolean;
    hasLand: boolean;
    usesTechnostructure: boolean;

    // 計算結果
    result: {
        maxLoanAmount: number;
        wishLoanAmount: number;
        totalBudget: number;
        buildingBudget: number;
        estimatedTsubo: number;
        estimatedSquareMeters: number;
        monthlyPaymentCapacity: number;
        dtiRatio: number;
        loanRatio: number;
        totalPayment: number;
        totalInterest: number;
        interestRate: number;
        loanTerm: number;
    };
}

/**
 * PDFバッファを生成する関数
 */
export async function generatePDFBuffer(data: SimulationData): Promise<Buffer> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    addJapaneseFonts(doc);
    const fontFamily = getJapaneseFontFamily(doc);

    // タイトル
    doc.setFontSize(20);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '家づくりシミュレーション結果', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    drawJapaneseText(doc, '住宅ローン試算レポート', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 6;
    doc.setFontSize(11);
    drawJapaneseText(doc, 'サンワイデア株式会社', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('ja-JP');
    drawJapaneseText(doc, `作成日: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // 線を引く
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // お客様情報セクション
    doc.setFontSize(14);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '■ お客様情報', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    drawJapaneseText(doc, `お名前: ${data.customerName}`, 25, yPosition);
    yPosition += 5;
    drawJapaneseText(doc, `年齢: ${data.age}歳`, 25, yPosition);
    yPosition += 5;
    drawJapaneseText(doc, `メールアドレス: ${data.email}`, 25, yPosition);
    yPosition += 10;

    // 試算結果サマリー
    doc.setFontSize(14);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '■ 試算結果サマリー', 20, yPosition);
    yPosition += 8;

    // サマリーボックス風の表示
    const summaryFillColor = { r: 245, g: 248, b: 250 };
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(summaryFillColor.r, summaryFillColor.g, summaryFillColor.b);
    doc.rect(20, yPosition, pageWidth - 40, 15, 'FD');

    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '希望借入金額', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    drawJapaneseText(doc, formatManWithOku(data.result.wishLoanAmount), pageWidth / 2, yPosition + 11, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    doc.setFillColor(summaryFillColor.r, summaryFillColor.g, summaryFillColor.b);
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, yPosition, pageWidth - 40, 15, 'FD');
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '月々の返済額', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    const monthlyPaymentValue = Number.isFinite(data.wishMonthlyPayment)
        ? data.wishMonthlyPayment
        : (data.result?.monthlyPaymentCapacity ?? 0);
    drawJapaneseText(doc, formatManWithOku(monthlyPaymentValue), pageWidth / 2, yPosition + 11, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 25;

    // 詳細な試算結果
    doc.setFontSize(14);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '■ 詳細な試算結果', 20, yPosition);
    yPosition += 8;

    const tableData = [
        ['最大借入可能額', formatManWithOku(data.result.maxLoanAmount)],
        ['総予算', formatManWithOku(data.result.totalBudget)],
        ['建築予算', formatManWithOku(data.result.buildingBudget)],
        ['推定坪数', `${data.result.estimatedTsubo.toFixed(1)}坪`],
        ['推定床面積', `${data.result.estimatedSquareMeters.toFixed(1)}㎡`],
    ];

    // テーブル描画
    drawTable(doc, tableData, 20, yPosition, (pageWidth - 40) / 2);
    yPosition += tableData.length * 8 + 15;

    // 注意事項
    doc.setDrawColor(243, 156, 18);
    doc.setFillColor(253, 242, 233);
    doc.rect(20, yPosition, pageWidth - 40, 15, 'FD');

    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(214, 137, 16);
    drawJapaneseText(doc, '※ この試算は概算であり、実際の融資条件とは異なる場合があります。', pageWidth / 2, yPosition + 6, { align: 'center' });
    drawJapaneseText(doc, '※ 詳細な条件については店舗でご相談ください。', pageWidth / 2, yPosition + 11, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // フッター
    yPosition = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    drawJapaneseText(doc, `家づくりシミュレーション | ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });

    // PDFをBufferとして返す
    const pdfArrayBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
}

// テーブル描画のヘルパー関数
function drawTable(doc: jsPDF, data: string[][], x: number, y: number, colWidth: number) {
    const rowHeight = 8;
    const fontFamily = getJapaneseFontFamily(doc);

    data.forEach((row, index) => {
        const currentY = y + (index * rowHeight);

        // 背景色（ヘッダー風）
        if (index === 0 || index % 2 === 0) {
            doc.setFillColor(236, 240, 241);
            doc.rect(x, currentY - 2, colWidth * 2, rowHeight - 1, 'F');
        }

        // 境界線
        doc.setDrawColor(189, 195, 199);
        doc.rect(x, currentY - 2, colWidth, rowHeight - 1, 'S');
        doc.rect(x + colWidth, currentY - 2, colWidth, rowHeight - 1, 'S');

        // テキスト
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'bold');
        drawJapaneseText(doc, row[0], x + 2, currentY + 3);
        doc.setFont(fontFamily, 'normal');
        drawJapaneseText(doc, row[1], x + colWidth + 2, currentY + 3);
    });
}

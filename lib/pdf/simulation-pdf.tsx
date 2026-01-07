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
    phone?: string;
    postalCode?: string;
    address?: string;

    // 収入情報
    ownIncome: number;
    spouseIncome?: number;
    ownLoanPayment: number;
    spouseLoanPayment?: number;

    // 希望条件
    downPayment: number;
    wishMonthlyPayment: number;
    wishPaymentYears: number;
    bonusPayment?: number;

    // フラグ
    hasSpouse: boolean;
    usesBonus: boolean;
    hasLand: boolean;
    hasExistingBuilding?: boolean;
    hasLandBudget?: boolean;
    landBudget?: number;
    usesTechnostructure: boolean;
    usesAdditionalInsulation?: boolean;

    // 計算結果
    result: {
        maxLoanAmount: number;
        wishLoanAmount: number;
        totalBudget: number;
        buildingBudget: number;
        landCost: number;
        demolitionCost: number;
        miscCost: number;
        estimatedTsubo: number;
        estimatedSquareMeters: number;
        monthlyPaymentCapacity: number;
        dtiRatio: number;
        loanRatio: number;
        totalPayment: number;
        totalInterest: number;
        screeningInterestRate: number;
        repaymentInterestRate: number;
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

    yPosition = ensureSpace(doc, yPosition, 28, fontFamily);
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    if (data.phone) {
        drawJapaneseText(doc, `電話番号: ${data.phone}`, 25, yPosition);
        yPosition += 5;
    }
    if (data.postalCode) {
        drawJapaneseText(doc, `郵便番号: ${data.postalCode}`, 25, yPosition);
        yPosition += 5;
    }
    if (data.address) {
        drawJapaneseText(doc, `住所: ${data.address}`, 25, yPosition);
        yPosition += 8;
    }

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

    yPosition = ensureSpace(doc, yPosition, 22, fontFamily);
    doc.setFillColor(summaryFillColor.r, summaryFillColor.g, summaryFillColor.b);
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, yPosition, pageWidth - 40, 15, 'FD');
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '返済期間', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    drawJapaneseText(doc, `${data.wishPaymentYears}年`, pageWidth / 2, yPosition + 11, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 25;

    // 詳細な試算結果
    doc.setFontSize(14);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '■ 詳細な試算結果', 20, yPosition);
    yPosition += 8;

    const tableData = [
        ['総予算', formatManWithOku(data.result.totalBudget)],
        ['建築予算', formatManWithOku(data.result.buildingBudget)],
        ['土地代', formatManWithOku(data.result.landCost)],
        ['解体費用', formatManWithOku(data.result.demolitionCost)],
        ['諸経費', formatManWithOku(data.result.miscCost)],
        ['推定坪数', `${data.result.estimatedTsubo.toFixed(1)}坪`],
        ['推定床面積', `${data.result.estimatedSquareMeters.toFixed(1)}㎡`],
    ];

    // テーブル描画
    drawTable(doc, tableData, 20, yPosition, (pageWidth - 40) / 2);
    yPosition += tableData.length * 8 + 15;

    yPosition = ensureSpace(doc, yPosition, 60, fontFamily);
    doc.setFontSize(14);
    doc.setFont(fontFamily, 'bold');
    drawJapaneseText(doc, '■ 入力条件', 20, yPosition);
    yPosition += 8;

    const conditionRows: string[][] = [
        ['年齢', `${data.age}歳`],
        ['年収（本人）', formatManWithOku(data.ownIncome)],
        ['年収（配偶者）', formatManWithOku(data.spouseIncome ?? 0)],
        ['既存借入返済額（本人）', formatManWithOku(data.ownLoanPayment)],
        ['既存借入返済額（配偶者）', formatManWithOku(data.spouseLoanPayment ?? 0)],
        ['自己資金', formatManWithOku(data.downPayment)],
        ['希望返済月額', formatManWithOku(data.wishMonthlyPayment)],
        ['希望返済年数', `${data.wishPaymentYears}年`],
    ];

    if (data.usesBonus) {
        conditionRows.push(['ボーナス払い', `利用する（${formatManWithOku(data.bonusPayment ?? 0)}）`]);
    } else {
        conditionRows.push(['ボーナス払い', '利用しない']);
    }

    conditionRows.push(['土地の所有', data.hasLand ? 'あり' : 'なし']);
    if (data.hasLand) {
        conditionRows.push(['既存建築物', data.hasExistingBuilding ? 'あり' : 'なし']);
    } else {
        conditionRows.push(['土地予算の有無', data.hasLandBudget ? 'あり' : 'なし']);
        if (data.hasLandBudget) {
            conditionRows.push(['土地予算', formatManWithOku(data.landBudget ?? 0)]);
        }
    }

    const specLabel = buildSpecLabel(data.usesTechnostructure, data.usesAdditionalInsulation);
    conditionRows.push(['仕様', specLabel]);

    drawTable(doc, conditionRows, 20, yPosition, (pageWidth - 40) / 2);
    yPosition += conditionRows.length * 8 + 15;

    yPosition = ensureSpace(doc, yPosition, 30, fontFamily);
    doc.setDrawColor(243, 156, 18);
    doc.setFillColor(253, 242, 233);
    doc.rect(20, yPosition, pageWidth - 40, 24, 'FD');

    doc.setFontSize(10);
    doc.setFont(fontFamily, 'normal');
    doc.setTextColor(214, 137, 16);
    drawJapaneseText(doc, '※ 本資料は無料のシミュレーション結果です。融資や契約の確定を示すものではありません。', pageWidth / 2, yPosition + 7, { align: 'center' });
    drawJapaneseText(doc, '※ プランイメージはあくまでサンプルです。実際の内容は担当者とご相談ください。', pageWidth / 2, yPosition + 13, { align: 'center' });
    drawJapaneseText(doc, '※ 記録用の参考資料として保存されます。', pageWidth / 2, yPosition + 19, { align: 'center' });
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

function ensureSpace(doc: jsPDF, yPosition: number, requiredHeight: number, fontFamily: string): number {
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 20;
    if (yPosition + requiredHeight <= pageHeight - bottomMargin) {
        return yPosition;
    }
    doc.addPage();
    doc.setFont(fontFamily, 'normal');
    return 20;
}

function buildSpecLabel(usesTechnostructure: boolean, usesAdditionalInsulation?: boolean): string {
    const base = usesTechnostructure ? "テクノストラクチャー + 長期優良住宅" : "長期優良住宅仕様";
    return usesAdditionalInsulation ? `${base} + 付加断熱` : base;
}

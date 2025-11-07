import fs from "node:fs";
import path from "node:path";
import jsPDF from "jspdf";

const FONT_FAMILY = "NotoSansJP";
const FONT_FILE_NAME = "NotoSansJP-Regular.ttf";
const FALLBACK_FONT = "helvetica";

let fontRegistrationState: "pending" | "loaded" | "failed" = "pending";
let cachedFontData: string | null = null;

function loadFontData(): string | null {
    if (cachedFontData) {
        return cachedFontData;
    }

    const inlineFont = process.env.PDF_JP_FONT_DATA;
    if (inlineFont) {
        cachedFontData = inlineFont.trim();
        return cachedFontData;
    }

    const configuredPath = process.env.PDF_JP_FONT_PATH;
    const defaultPath = path.join(process.cwd(), "public", "fonts", FONT_FILE_NAME);
    const fontPath = configuredPath || defaultPath;

    if (fs.existsSync(fontPath)) {
        cachedFontData = fs.readFileSync(fontPath).toString("base64");
        return cachedFontData;
    }

    console.warn(
        `[pdf] 日本語フォントが見つかりませんでした。` +
        `\n- PDF_JP_FONT_PATH: ${configuredPath || "(未設定)"}` +
        `\n- 既定の探索パス: ${defaultPath}\n` +
        "日本語を正しく表示するにはフォントファイルを配置するか、PDF_JP_FONT_DATAにBase64を設定してください。"
    );
    return null;
}

export function addJapaneseFonts(doc: jsPDF): boolean {
    if (fontRegistrationState === "loaded") {
        doc.setFont(FONT_FAMILY, "normal");
        return true;
    }

    const fontData = loadFontData();
    if (!fontData) {
        fontRegistrationState = "failed";
        doc.setFont(FALLBACK_FONT, "normal");
        return false;
    }

    try {
        doc.addFileToVFS(FONT_FILE_NAME, fontData);
        doc.addFont(FONT_FILE_NAME, FONT_FAMILY, "normal");
        doc.addFont(FONT_FILE_NAME, FONT_FAMILY, "bold");
        doc.setFont(FONT_FAMILY, "normal");
        fontRegistrationState = "loaded";
        return true;
    } catch (error) {
        console.warn("日本語フォントの登録に失敗しました:", error);
        fontRegistrationState = "failed";
        doc.setFont(FALLBACK_FONT, "normal");
        return false;
    }
}

export function drawJapaneseText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options?: { align?: "left" | "center" | "right" | "justify" }
) {
    if (fontRegistrationState !== "loaded") {
        doc.setFont(FALLBACK_FONT, "normal");
        doc.text(convertToFallbackText(text), x, y, options);
        return;
    }

    doc.text(text, x, y, options);
}

export function getJapaneseFontFamily() {
    return fontRegistrationState === "loaded" ? FONT_FAMILY : FALLBACK_FONT;
}

function convertToFallbackText(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/[\u3040-\u30FF\u4E00-\u9FFF]+/g, "(日本語テキスト)");
}

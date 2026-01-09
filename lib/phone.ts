// 全角数字や記号を取り除き、数字のみの電話番号に正規化する
export function normalizePhoneNumber(value: string): string {
    return value
        .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xFEE0))
        .replace(/\D/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
    const digits = normalizePhoneNumber(value);
    return digits.length === 10 || digits.length === 11;
}

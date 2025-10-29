const formatterYen = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
});

const formatterNumber = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 2,
});

export function formatYen(value: number): string {
    return formatterYen.format(Math.round(value));
}

export function formatNumber(value: number, digits = 2): string {
    const formatter = digits === 2 ? formatterNumber : new Intl.NumberFormat("ja-JP", {
        maximumFractionDigits: digits,
    });
    return formatter.format(value);
}

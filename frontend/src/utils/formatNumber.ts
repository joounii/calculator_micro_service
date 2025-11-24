export function formatNumber(
    value: unknown,
    locale: string = "de-CH",
    fractionDigits: number = 6
): string {
    const n = Number(value as any);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat(locale, { maximumFractionDigits: fractionDigits }).format(n);
}

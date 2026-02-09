export function formatCurrency(amount: number, currency: string = "INR"): string {
    if (currency === "INR") {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `₹${amount}`;
}
export function formatCurrencySimple(amount: number): string {
    return `₹${amount}`;
}

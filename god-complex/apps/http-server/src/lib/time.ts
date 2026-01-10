export function getTodayDate():string{
   return new Date().toISOString().split("T")[0];
}

export function getMonth(date: string): string{
    return date.slice(0,7);
}

export function isBeforeCutoff(cutoffHour: number ) : boolean{
    const now = new Date();
    return now.getUTCHours() < cutoffHour;
}
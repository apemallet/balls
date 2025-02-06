export interface Winner {
  id: number;
  name: string;
  timestamp: string; // exact time
  markedPresent: boolean;
}

export interface WinnerHistoryEntry {
  date: string; // Date (YYYY-MM-DD format)
  winners: Winner[];
}

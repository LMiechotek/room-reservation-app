export type ReportSummary = {
  totalReservations: number;
  canceled: number;
  roomsUsed: number;
};

export type DailyStats = {
  date: string;
  reservations: number;
  canceled: number;
  roomsUsed: number;
};

export type ReservationItem = {
  id: string;
  date: string;
  room: string;
  block: string;
  shift: string;
  lesson: number;
  startTime: string;
  endTime: string;
  status: string;
  professor: string;
};
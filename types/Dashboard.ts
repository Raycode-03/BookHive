// types/dashboard.ts
import { LoanWithBook, ReservationWithBook } from './BookCard'

export interface DashboardStats {
    ActiveLoansCount: number;
    ActiveReservesCount: number;
    OverdueLoansCount: number;
    ActiveLoansList: LoanWithBook[];
    ActiveReservesList: ReservationWithBook[];
    OverdueLoansList: LoanWithBook[];
}

export interface ResourcesProps {
    stats?: DashboardStats;
}

export interface OverdueloansProps {
    stats?: DashboardStats;
}

export interface ReservationsProps {
    stats?: DashboardStats;
}
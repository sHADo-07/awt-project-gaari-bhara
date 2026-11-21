export enum RentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ONGOING = "ONGOING",
  ENDED = "ENDED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export const RENT_TRANSITIONS: Record<RentStatus, readonly RentStatus[]> = {
  [RentStatus.PENDING]: [RentStatus.CONFIRMED, RentStatus.DECLINED, RentStatus.CANCELLED, RentStatus.EXPIRED],
  [RentStatus.CONFIRMED]: [RentStatus.ONGOING, RentStatus.CANCELLED],
  [RentStatus.ONGOING]: [RentStatus.ENDED],
  [RentStatus.ENDED]: [],
  [RentStatus.DECLINED]: [],
  [RentStatus.CANCELLED]: [],
  [RentStatus.EXPIRED]: [],
};

export function canChangeRentStatus(from: RentStatus, to: RentStatus): boolean {
  return RENT_TRANSITIONS[from].includes(to);
}

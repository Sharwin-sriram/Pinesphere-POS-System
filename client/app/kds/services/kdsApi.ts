import { httpClient } from "../../lib/authService";
import {
  KDSTicket,
  KDSTicketsResponse,
  KDSStats,
  KDSStation,
  KDSFilterStatus,
} from "../types";

const BASE = "/api/kds";

export const kdsApi = {
  /** Fetch active kitchens to populate station tabs */
  getStations: async (kdsId: string): Promise<KDSStation[]> => {
    const response = await httpClient.get(`${BASE}/kitchens/`, {
      params: { kds_id: kdsId },
    });
    return response.data;
  },

  /** Fetch tickets for a station, filtered by status and optional order type */
  getTickets: async (
    stationId: string,
    filterStatus: KDSFilterStatus = "active",
    orderType?: string
  ): Promise<KDSTicketsResponse> => {
    const response = await httpClient.get(`${BASE}/tickets/`, {
      params: {
        station: stationId,
        status: filterStatus,
        ...(orderType ? { order_type: orderType } : {}),
      },
    });
    return response.data;
  },

  /** Mark a ticket as completed (bump) */
  bumpTicket: async (ticketId: string): Promise<KDSTicket> => {
    const response = await httpClient.patch(`${BASE}/tickets/${ticketId}/bump/`);
    return response.data;
  },

  /** Revert a bumped ticket back to active (recall) */
  recallTicket: async (ticketId: string): Promise<KDSTicket> => {
    const response = await httpClient.patch(`${BASE}/tickets/${ticketId}/recall/`);
    return response.data;
  },

  /** Toggle the hold flag on a ticket */
  holdTicket: async (ticketId: string): Promise<KDSTicket> => {
    const response = await httpClient.patch(`${BASE}/tickets/${ticketId}/hold/`);
    return response.data;
  },

  /** Fetch aggregate stats for a station */
  getStats: async (stationId: string): Promise<KDSStats> => {
    const response = await httpClient.get(`${BASE}/tickets/stats/`, {
      params: { station: stationId },
    });
    return response.data;
  },
};

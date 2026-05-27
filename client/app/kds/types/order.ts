export type Order = {
 id: string;
 backendId?: string;
 table: string;
 items: number;
 status: string;
 time: string;
 priority: string;
 kotNumber?: string;
 rawStatus?: string;
 customer?: string;
 amount?: string;
 payment?: string;
};
import {
  DeliveryOrder,
  Rider,
} from "../types/delivery";

export const orders: DeliveryOrder[] = [
  {
    id: 1001,
    branchId: 1,

    customerId: 11,

    customer: "Rahul Sharma",

    address: "RS Puram, Coimbatore",

    orderType: "DELIVERY",

    status: "CONFIRMED",

    deliveryStatus: "Out for Delivery",

    totalAmount: 890,
    taxAmount: 40,
    discountAmount: 0,
    netAmount: 930,

    rider: "Arjun",

    eta: "15 mins",

    paymentMethod: "UPI",

    otpVerified: false,

    createdAt: "2026-05-26T10:00:00Z",
    updatedAt: "2026-05-26T10:15:00Z",
  },

  {
    id: 1002,
    branchId: 1,

    customerId: 12,

    customer: "Priya",

    address: "Peelamedu, Coimbatore",

    orderType: "DELIVERY",

    status: "PREPARING",

    deliveryStatus: "Preparing",

    totalAmount: 560,
    taxAmount: 28,
    discountAmount: 20,
    netAmount: 568,

    rider: "Karthik",

    eta: "25 mins",

    paymentMethod: "CASH",

    otpVerified: false,

    createdAt: "2026-05-26T09:45:00Z",
    updatedAt: "2026-05-26T10:10:00Z",
  },
];

export const riders: Rider[] = [
  {
    id: "RID-1",

    name: "Arjun",

    phone: "+91 9876543210",

    status: "Delivering",

    vehicle: "Bike",

    earnings: 4200,

    deliveries: 32,

    rating: 4.8,

    currentLatitude: 11.0168,
    currentLongitude: 76.9558,
  },

  {
    id: "RID-2",

    name: "Karthik",

    phone: "+91 9123456780",

    status: "Online",

    vehicle: "Scooter",

    earnings: 3100,

    deliveries: 21,

    rating: 4.6,

    currentLatitude: 11.025,
    currentLongitude: 76.97,
  },
];
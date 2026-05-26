import axios from "axios";

const BASE_URL =
 "http://localhost:8000/api";

export const getInventoryItems =
 async () => {
 const response = await axios.get(
 `${BASE_URL}/inventory/items/`
 );

 return response.data;
 };

export const getSuppliers =
 async () => {
 const response = await axios.get(
 `${BASE_URL}/inventory/suppliers/`
 );

 return response.data;
 };

export const getPurchaseOrders =
 async () => {
 const response = await axios.get(
 `${BASE_URL}/inventory/purchase-orders/`
 );

 return response.data;
 };
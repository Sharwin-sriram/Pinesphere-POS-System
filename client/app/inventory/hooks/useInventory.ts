"use client";

import { useEffect, useState } from "react";

import { InventoryItem } from "../types/inventory";

import {
 getInventoryItems,
} from "../services/inventoryApi";

export default function useInventory() {
 const [items, setItems] = useState<InventoryItem[]>([]);

 const [loading, setLoading] = useState(true);

 const [error, setError] = useState("");

 useEffect(() => {
 let isMounted = true;

 const fetchItems = async () => {
 try {
 const data = await getInventoryItems();
 if (isMounted) {
 setItems(data);
 setError("");
 }
 } catch {
 if (isMounted) {
 setError("Failed to fetch inventory items");
 }
 } finally {
 if (isMounted) {
 setLoading(false);
 }
 }
 };

 void fetchItems();

 return () => {
 isMounted = false;
 };
 }, []);

 return {
 items,
 loading,
 error,
 };
}
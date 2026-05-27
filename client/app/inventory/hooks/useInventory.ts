"use client";

import { useEffect, useState } from "react";

import { InventoryItem } from "../types/inventory";

import {
 getInventoryItems,
} from "../services/inventoryApi";

export default function useInventory() {
 const [items, setItems] =
 useState<InventoryItem[]>([]);

 const [loading, setLoading] =
 useState(true);

 const [error, setError] =
 useState("");

 useEffect(() => {
 const fetchItems = async () => {
 try {
 const data =
 await getInventoryItems();

 setItems(data);
 const timeoutId = window.setTimeout(() => {
 void fetchItems();
 }, 0);

 return () => window.clearTimeout(timeoutId);
 setError(
 "Failed to fetch inventory items"
 );
 } finally {
 setLoading(false);
 }
 };

 fetchItems();
 }, []);

 return {
 items,
 loading,
 error,
 };
}
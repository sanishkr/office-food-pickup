import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Order, OrderStatus } from "../types/Order";

export function useSupabaseTrackingOrders(shouldLoad = true) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(shouldLoad);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  // Keep track of component mount state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadOrders = useCallback(async () => {
    if (!mounted.current) return;

    try {
      setLoading(true);
      // Get the start and end of today in UTC
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toISOString();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startOfDay)
        .lt("created_at", endOfDay)
        .order("created_at", { ascending: false });

      if (!mounted.current) return;

      if (error) {
        setError(error.message);
        return;
      }

      const mappedOrders = (data || []).map((order) => ({
        id: order.id,
        employeeName: order.employee_name,
        phoneNumber: order.phone_number,
        orderId: order.order_id,
        estimatedDelivery: new Date(order.estimated_delivery),
        status: order.status as OrderStatus,
        createdAt: new Date(order.created_at),
        platform: order.platform,
        notes: order.notes,
      }));

      setOrders(mappedOrders);
      setError(null);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!shouldLoad) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Initial load
    loadOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel("tracking-orders")
      .on(
        "postgres_changes" as const,
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          const { eventType, new: n } = payload;

          // For inserts and updates, check if it's a today's order
          if (eventType === "INSERT" || eventType === "UPDATE") {
            const eventDate = new Date(n.created_at);
            const today = new Date();
            const isToday =
              eventDate.getDate() === today.getDate() &&
              eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear();

            // Only reload if it's a today's order
            if (isToday && mounted.current) {
              await loadOrders();
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [shouldLoad, loadOrders]);

  return { orders, loading, error };
}

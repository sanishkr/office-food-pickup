import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Order, OrderStatus } from "../types/Order";
import type { StoredOrder } from "../components/MyOrders";

export function useSupabaseMyOrders(shouldLoad: boolean) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(shouldLoad);
  const [error, setError] = useState<string | null>(null);
  const [localOrderIds, setLocalOrderIds] = useState<string[]>([]);
  const mounted = useRef(false);

  // Keep track of component mount state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (mounted.current && shouldLoad) {
      setLocalOrderIds(() => {
        const saved = localStorage.getItem("myOrderIds");
        return saved ? JSON.parse(saved).map((o: StoredOrder) => o.id) : [];
      });
    }
  }, [shouldLoad, mounted]);

  const loadOrders = useCallback(async () => {
    if (!shouldLoad || !mounted.current || !localOrderIds.length) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // For now, just get all orders since we don't have employee filtering yet
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("order_id", localOrderIds)
        .order("created_at", { ascending: false })
        .limit(50);

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
  }, [shouldLoad, JSON.stringify(localOrderIds)]);

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
      .channel("my-orders")
      .on(
        "postgres_changes" as const,
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async () => {
          if (mounted.current) {
            await loadOrders();
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

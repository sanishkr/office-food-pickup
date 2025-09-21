import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  map,
  type Order,
  type OrderStatus,
  type SupabaseOrder,
} from "../types/Order";
import type { StoredOrder } from "../components/MyOrders";
import { useNotifications } from "./useNotifications";

export function useSupabaseMyOrders(
  shouldLoad: boolean,
  shouldNotifyForMyOrders: boolean // this flag enables/disables real-time order updates and notifications for order status updates
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(shouldLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<string>("");
  const [localOrderIds, setLocalOrderIds] = useState<string[]>([]);
  const { notificationPermission, requestPermission, sendNotification } =
    useNotifications();
  const mounted = useRef(false);

  // Keep track of component mount state
  useEffect(() => {
    const savedName = localStorage.getItem("employeeName");
    if (savedName) {
      setCurrentEmployee(savedName);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, JSON.stringify(localOrderIds)]);

  useEffect(() => {
    if (!shouldLoad) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Initial load
    loadOrders();
  }, [shouldLoad, loadOrders]);

  useEffect(() => {
    if (shouldNotifyForMyOrders) {
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
          async (payload) => {
            const { eventType } = payload;
            const n = payload.new as SupabaseOrder;
            const o = payload.old as SupabaseOrder;

            // Request notification permission if not already granted
            if (notificationPermission === "default") {
              requestPermission();
            }

            if (eventType === "UPDATE" && n) {
              // Check if status changed to arrived or collected
              const oldOrder = map(o);
              const newOrder = map(n);

              if (
                oldOrder &&
                localOrderIds.includes(newOrder.orderId) && // Only notify for current employee's local orders
                newOrder.employeeName === currentEmployee && // #TBD: Only notify for current employee's orders
                (newOrder.status === "arrived" ||
                  newOrder.status === "collected") // Only notify for arrived or collected status
              ) {
                const title = `Your order #${newOrder.orderId} ${newOrder.status}!`;
                const body = `Your ${newOrder.platform} order has ${
                  newOrder.status === "arrived" ? "arrived" : "been collected"
                }. Please ${
                  newOrder.status === "arrived"
                    ? "come collect it"
                    : "wait while it arrives in office pantry"
                }!`;

                if (notificationPermission === "granted") {
                  sendNotification(title, {
                    body,
                    icon: "/pwa-192x192.png", // Using the PWA icon
                    badge: "/pwa-192x192.png",
                    tag: `order-${newOrder.orderId}-${newOrder.status}`, // Prevents duplicate notifications
                    requireInteraction: false, // DO NOT keep notification visible until user interacts with it
                  });
                }
              }
            }

            if (mounted.current) {
              await loadOrders();
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldNotifyForMyOrders,
    loadOrders,
    currentEmployee,
    notificationPermission,
    // requestPermission,
    // sendNotification,
  ]);

  return { orders, loading, error };
}

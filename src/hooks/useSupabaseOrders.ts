import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Order, OrderStatus } from "../types/Order";

export function useSupabaseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("userOrders");
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders).map(
          (
            order: Omit<Order, "estimatedDelivery" | "createdAt"> & {
              estimatedDelivery: string;
              createdAt: string;
            }
          ) => ({
            ...order,
            estimatedDelivery: new Date(order.estimatedDelivery),
            createdAt: new Date(order.createdAt),
          })
        );
        setOrders(parsedOrders);
      } catch (e) {
        console.error("Error parsing saved orders:", e);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("userOrders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const supabaseOrders = (data || []).map((o) => ({
          id: o.id,
          employeeName: o.employee_name,
          phoneNumber: o.phone_number,
          orderId: o.order_id,
          estimatedDelivery: new Date(o.estimated_delivery),
          status: o.status as OrderStatus,
          createdAt: new Date(o.created_at),
          platform: o.platform,
        }));

        // Merge with existing orders from localStorage, preferring Supabase data
        setOrders((prevOrders) => {
          const mergedOrders = [...supabaseOrders];
          // Add orders from localStorage that don't exist in Supabase
          prevOrders.forEach((localOrder) => {
            if (
              !supabaseOrders.some((so) => so.orderId === localOrder.orderId)
            ) {
              mergedOrders.push({
                ...localOrder,
                platform: localOrder.platform || "unknown",
              });
            }
          });
          return mergedOrders;
        });
      } catch (error: unknown) {
        console.error(error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }
    load();

    const sub = supabase
      .channel("orders-ch")
      .on(
        "postgres_changes",
        { schema: "public", table: "orders", event: "*" },
        ({
          eventType,
          new: n,
          old: o,
        }: {
          eventType: "INSERT" | "UPDATE" | "DELETE";
          new: SupabaseOrder;
          old: SupabaseOrder;
        }) => {
          setOrders((curr) => {
            if (eventType === "INSERT") {
              return [{ ...map(n) }, ...curr];
            }
            if (eventType === "UPDATE") {
              return curr.map((x) => (x.id === n.id ? map(n) : x));
            }
            if (eventType === "DELETE") {
              return curr.filter((x) => x.id !== o.id);
            }
            return curr;
          });
        }
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return { orders, loading, error };
}

interface SupabaseOrder {
  id: string;
  employee_name: string;
  phone_number: string;
  order_id: string;
  estimated_delivery: string;
  status: OrderStatus;
  created_at: string;
  platform: string;
}

function map(o: SupabaseOrder): Order {
  return {
    id: o.id,
    employeeName: o.employee_name,
    phoneNumber: o.phone_number,
    orderId: o.order_id,
    estimatedDelivery: new Date(o.estimated_delivery),
    status: o.status,
    createdAt: new Date(o.created_at),
    platform: o.platform,
  };
}

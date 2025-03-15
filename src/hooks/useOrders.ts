import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase-client";
import { useAuth } from "../context/AuthContext";

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("orders")
          .select("*, documents(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Unknown error fetching orders"),
        );
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up realtime subscription
    const subscription = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? payload.new : order,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((order) => order.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, documents(*), translations(*)")
        .eq("id", orderId)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Error fetching order details:", err);
      throw err;
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    getOrderDetails,
    createOrder,
  };
}

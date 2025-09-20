import { useState, useEffect, useRef } from "react";
import EmployeeOrderForm from "./components/EmployeeOrderForm";
import OrderTrackingTable from "./components/OrderTrackingTable";
// import HistoricalView from "./components/HistoricalView";
import MyOrders from "./components/MyOrders";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import type { Order, OrderStatus } from "./types/Order";
import { useSupabaseMyOrders } from "./hooks/useSupabaseMyOrders";
import { useSupabaseTrackingOrders } from "./hooks/useSupabaseTrackingOrders";
import { supabase } from "./lib/supabase";

function App() {
  type ViewType = "employee" | "myOrders" | "tracking" | "historical";

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem("currentView");
    return (savedView as ViewType) || "employee";
  });
  const mounted = useRef(false);

  // Keep track of component mount state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Fetch tracking orders only when in tracking view
  const {
    orders: trackingOrders,
    loading: trackingLoading,
    error: trackingError,
  } = useSupabaseTrackingOrders(mounted.current && currentView === "tracking");

  // Fetch my orders only when in myOrders view
  const shouldFetchMyOrders = ["myOrders"].includes(currentView);

  const {
    orders: myOrders,
    loading: myOrdersLoading,
    error: myOrdersError,
  } = useSupabaseMyOrders(shouldFetchMyOrders);

  useEffect(() => {
    localStorage.setItem("currentView", currentView);
  }, [currentView]);

  const handleOrderSubmitted = () => {
    // Switch to My Orders view after submission
    setCurrentView("myOrders");
  };

  const handleBackToForm = () => {
    setCurrentView("employee");
  };

  const addOrder = async (newOrder: Omit<Order, "id" | "createdAt">) => {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          employee_name: newOrder.employeeName,
          phone_number: newOrder.phoneNumber,
          order_id: newOrder.orderId,
          estimated_delivery: newOrder.estimatedDelivery.toISOString(),
          status: newOrder.status,
          platform: newOrder.platform,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data.id;
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form view has no loading state */}

      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center py-3 border-b border-gray-100 sm:border-b-0 sm:justify-start sm:py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center p-1">
                <img
                  src="/pwa-128x128.png"
                  alt="Food Pickup Tracker"
                  className="w-8 h-8"
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Food Pickup Tracker
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="py-3 sm:py-0 sm:absolute sm:top-4 sm:right-4 lg:right-8">
            <div className="grid grid-cols-3 gap-1 sm:flex sm:space-x-1">
              <button
                onClick={() => setCurrentView("employee")}
                className={`px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${
                  currentView === "employee"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">Add Order</span>
                <span className="sm:hidden">Add order</span>
              </button>
              <button
                onClick={() => setCurrentView("myOrders")}
                className={`px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${
                  currentView === "myOrders"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">My Orders</span>
                <span className="sm:hidden">My Orders</span>
              </button>
              <button
                onClick={() => setCurrentView("tracking")}
                className={`px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${
                  currentView === "tracking"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">Track Orders</span>
                <span className="sm:hidden">Track</span>
              </button>
              {/* History tab - Hidden on mobile, visible on sm and up */}
              {/* <button
                onClick={() => setCurrentView("historical")}
                className={`hidden sm:block px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${
                  currentView === "historical"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">History</span>
              </button> */}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        {/* Order Form */}
        {currentView === "employee" && (
          <EmployeeOrderForm
            onAddOrder={addOrder}
            onOrderSubmitted={handleOrderSubmitted}
          />
        )}

        {/* My Orders */}
        {currentView === "myOrders" && (
          <>
            {myOrdersLoading && (
              <p className="text-center py-12">Loading your orders…</p>
            )}
            {myOrdersError && (
              <p className="text-center text-red-600">{myOrdersError}</p>
            )}
            {!myOrdersLoading && !myOrdersError && (
              <>
                <MyOrders
                  orders={myOrders}
                  onBackToForm={handleBackToForm}
                  onDeleteOrder={handleDeleteOrder}
                />
              </>
            )}
          </>
        )}

        {/* Order Tracking */}
        {currentView === "tracking" && (
          <>
            {trackingLoading && (
              <p className="text-center py-12">Loading today's orders…</p>
            )}
            {trackingError && (
              <p className="text-center text-red-600">{trackingError}</p>
            )}
            {!trackingLoading && !trackingError && (
              <OrderTrackingTable
                orders={trackingOrders}
                onUpdateStatus={handleUpdateStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            )}
          </>
        )}

        {/* Historical View */}
        {/* {currentView === "historical" && (
          <>
            {myOrdersLoading && (
              <p className="text-center py-12">Loading order history…</p>
            )}
            {myOrdersError && (
              <p className="text-center text-red-600">{myOrdersError}</p>
            )}
            {!myOrdersLoading && !myOrdersError && (
              <HistoricalView orders={myOrders} />
            )}
          </>
        )} */}
      </main>

      <PWAInstallPrompt />
    </div>
  );
}

export default App;

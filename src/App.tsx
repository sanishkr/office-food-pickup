import { useState, useEffect } from "react";
import EmployeeOrderForm from "./components/EmployeeOrderForm";
import OrderTrackingTable from "./components/OrderTrackingTable";
import HistoricalView from "./components/HistoricalView";
import OrderStatusPage from "./components/OrderStatusPage";
import MyOrders from "./components/MyOrders";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import type { Order, OrderStatus } from "./types/Order";

function App() {
  const [currentView, setCurrentView] = useState<
    "employee" | "myOrders" | "tracking" | "historical" | "orderStatus"
  >("employee");
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Mock data for development
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        employeeName: "John Doe",
        phoneNumber: "+1234567890",
        orderId: "ZOM123456",
        estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        status: "ordered",
        createdAt: new Date(),
        platform: "Zomato",
      },
      {
        id: "2",
        employeeName: "Jane Smith",
        phoneNumber: "+1987654321",
        orderId: "SWG789012",
        estimatedDelivery: new Date(Date.now() + 45 * 60000), // 45 minutes from now
        status: "arrived",
        createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        platform: "Swiggy",
      },
      {
        id: "3",
        employeeName: "Mike Johnson",
        phoneNumber: "+1122334455",
        orderId: "UBR345678",
        estimatedDelivery: new Date(Date.now() - 10 * 60000), // 10 minutes ago (overdue)
        status: "collected",
        createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
        platform: "Uber Eats",
      },
    ];
    setOrders(mockOrders);
  }, []);

  const addOrder = (newOrder: Omit<Order, "id" | "createdAt">) => {
    const order: Order = {
      ...newOrder,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setOrders((prev) => [...prev, order]);
    return order.id;
  };

  const handleOrderSubmitted = () => {
    // Navigate to My Orders instead of individual order status
    setCurrentView("myOrders");
    setCurrentOrderId(null);
  };

  const handleBackToForm = () => {
    setCurrentView("employee");
    setCurrentOrderId(null);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button
                onClick={() => setCurrentView("historical")}
                className={`hidden sm:block px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center ${
                  currentView === "historical"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PWA Install Prompt - Show only on the main employee form view */}
        {currentView === "employee" && <PWAInstallPrompt />}

        {currentView === "employee" && (
          <EmployeeOrderForm
            onAddOrder={(order) => {
              addOrder(order);
              handleOrderSubmitted();
            }}
            onOrderSubmitted={handleOrderSubmitted}
          />
        )}

        {currentView === "myOrders" && (
          <MyOrders
            orders={orders}
            onBackToForm={handleBackToForm}
            onDeleteOrder={deleteOrder}
          />
        )}

        {currentView === "orderStatus" && currentOrderId && (
          <OrderStatusPage
            orderId={currentOrderId}
            orders={orders}
            onBackToForm={handleBackToForm}
            onUpdateStatus={updateOrderStatus}
          />
        )}

        {currentView === "tracking" && (
          <OrderTrackingTable
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onDeleteOrder={deleteOrder}
          />
        )}

        {currentView === "historical" && <HistoricalView orders={orders} />}
      </main>
    </div>
  );
}

export default App;

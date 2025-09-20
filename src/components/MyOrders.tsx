import { useState, useEffect } from "react";
import type { Order } from "../types/Order";

export interface StoredOrder {
  id: string;
  date: string;
  employeeName: string;
}

interface MyOrdersProps {
  orders: Order[];
  onBackToForm: () => void;
  onDeleteOrder?: (orderId: string) => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({
  orders,
  onBackToForm,
  onDeleteOrder,
}) => {
  const [currentEmployee, setCurrentEmployee] = useState<string>("");
  const [showPastOrders, setShowPastOrders] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  // Get current employee name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("employeeName");
    if (savedName) {
      setCurrentEmployee(savedName);
    }
  }, []);

  // Get stored order references for the current employee
  const [employeeOrderRefs, setEmployeeOrderRefs] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (currentEmployee) {
      const storedRefs = localStorage.getItem("myOrderIds");
      if (storedRefs) {
        const allRefs = JSON.parse(storedRefs);
        // Filter refs for current employee
        const employeeRefs = allRefs.filter(
          (ref: StoredOrder) => ref.employeeName === currentEmployee
        );
        setEmployeeOrderRefs(employeeRefs);
      }
    }
  }, [currentEmployee]);

  // Helper function to check if a date is today
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Filter orders based on stored references
  const myOrders = orders.filter((order) =>
    employeeOrderRefs.some((ref) => ref.id === order.orderId)
  );

  // Separate today's orders from past orders using the stored dates
  const todayOrders = myOrders.filter((order) => {
    const ref = employeeOrderRefs.find((ref) => ref.id === order.orderId);
    return ref && isToday(ref.date);
  });

  const pastOrders = myOrders.filter((order) => {
    const ref = employeeOrderRefs.find((ref) => ref.id === order.orderId);
    return ref && !isToday(ref.date);
  });

  // Sort by creation date (most recent first)
  const sortedTodayOrders = todayOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedPastOrders = pastOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered":
        return "📱";
      case "collected":
        return "🚚"; // Security collected from gate
      case "arrived":
        return "✅"; // Brought inside office
      default:
        return "📱";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "collected":
        return "bg-blue-100 text-blue-800 border-blue-200"; // Security collected from gate
      case "arrived":
        return "bg-green-100 text-green-800 border-green-200"; // Brought inside office
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeStatus = (estimatedDelivery: Date, status: string) => {
    const now = new Date();
    const timeDiff = estimatedDelivery.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (status === "arrived") {
      return { text: "Ready to eat!", color: "text-green-600", icon: "🎉" };
    }

    if (status === "collected") {
      return {
        text: "Collected by security",
        color: "text-blue-600",
        icon: "🚚",
      };
    }

    if (minutesDiff < 0) {
      return {
        text: `${Math.abs(minutesDiff)} min overdue`,
        color: "text-red-600 font-semibold",
        icon: "⚠️",
      };
    } else if (minutesDiff <= 10) {
      return {
        text: `Arriving in ${minutesDiff} min`,
        color: "text-orange-600 font-medium",
        icon: "🕐",
      };
    } else {
      return {
        text: `Expected in ${minutesDiff} min`,
        color: "text-gray-600",
        icon: "⏰",
      };
    }
  };

  if (!currentEmployee) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-3xl sm:text-4xl mb-4">👤</div>
          <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-2">
            No orders found
          </h2>
          <p className="text-yellow-700 mb-6 text-sm sm:text-base">
            Please add an order first to see your orders here.
          </p>
          <button
            onClick={onBackToForm}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-3 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg sm:text-xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                My Orders
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Welcome back, {currentEmployee}!
              </p>
            </div>
          </div>
          <button
            onClick={onBackToForm}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
          >
            + Add New Order
          </button>
        </div>

        {/* Quick Summary - Today's orders only */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-yellow-50 px-2 sm:px-4 py-3 sm:py-2 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-yellow-800">
              {sortedTodayOrders.filter((o) => o.status === "ordered").length}
            </div>
            <div className="text-xs text-yellow-600">Ordered</div>
          </div>
          <div className="bg-blue-50 px-2 sm:px-4 py-3 sm:py-2 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-blue-800">
              {sortedTodayOrders.filter((o) => o.status === "collected").length}
            </div>
            <div className="text-xs text-blue-600">Collected</div>
          </div>
          <div className="bg-green-50 px-2 sm:px-4 py-3 sm:py-2 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-green-800">
              {sortedTodayOrders.filter((o) => o.status === "arrived").length}
            </div>
            <div className="text-xs text-green-600">Arrived</div>
          </div>
        </div>
      </div>

      {/* Today's Orders */}
      {sortedTodayOrders.length === 0 && sortedPastOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't added any orders yet.
          </p>
          <button
            onClick={onBackToForm}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Order
          </button>
        </div>
      ) : sortedTodayOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders today
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't added any orders today.
          </p>
          <button
            onClick={onBackToForm}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Order
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">📅</span>
              Today's Orders ({sortedTodayOrders.length})
            </h3>
          </div>
          {sortedTodayOrders.map((order) => {
            const timeStatus = getTimeStatus(
              order.estimatedDelivery,
              order.status
            );
            return (
              <div
                key={order.id}
                className="bg-white shadow-sm rounded-lg border overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Mobile: Stack vertically, Desktop: Side by side */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 border-2 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <span className="text-lg sm:text-xl">
                          {getStatusIcon(order.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{order.orderId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order added at{" "}
                          {order.createdAt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:self-auto">
                      <div className="sm:hidden text-xs text-gray-500 mb-1">
                        Status:
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-2 sm:py-1 rounded-full text-sm font-medium border-2 w-fit md:w-auto ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <span className="mr-2">
                          {getStatusIcon(order.status)}
                        </span>
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Stack all info, Desktop: 3 columns */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Platform</p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                          🍕 Zomato
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Estimated Delivery
                      </p>
                      <p className="font-medium text-gray-900 mt-1">
                        {order.estimatedDelivery.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div
                        className={`flex items-center mt-1 ${timeStatus.color}`}
                      >
                        <span className="mr-1">{timeStatus.icon}</span>
                        <span className="font-medium text-sm">
                          {timeStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {order.status === "ordered" && "1/3"}
                        {order.status === "collected" && "2/3"}
                        {order.status === "arrived" && "3/3"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                      <div
                        className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                          order.status === "ordered"
                            ? "bg-yellow-500 w-1/3"
                            : order.status === "collected"
                            ? "bg-blue-500 w-2/3"
                            : "bg-green-500 w-full"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Action Notifications - More compact on mobile */}
                  <div className="space-y-3">
                    {order.status === "ordered" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                          <strong className="block sm:inline">
                            📱 Order Added!
                          </strong>
                          <span className="block sm:inline sm:ml-1">
                            Your food status will be updated as soon as it is
                            collected.
                          </span>
                        </p>
                      </div>
                    )}

                    {order.status === "collected" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          <strong className="block sm:inline">
                            🚚 Food Collected!
                          </strong>
                          <span className="block sm:inline sm:ml-1">
                            Security has collected your order from the gate.
                          </span>
                        </p>
                      </div>
                    )}

                    {order.status === "arrived" && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">
                          <strong className="block sm:inline">
                            ✅ Food Arrived!
                          </strong>
                          <span className="block sm:inline sm:ml-1">
                            Your order is at the office reception/pantry. Please
                            collect it!
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Delete Button - Show for all orders if delete function is available */}
                    {onDeleteOrder && (
                      <div className="flex justify-end pt-2 border-t border-gray-100">
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              orderId: order.id,
                              orderNumber: order.orderId,
                            })
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                        >
                          <span className="mr-1">🗑️</span>
                          Delete Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Orders Section */}
      {sortedPastOrders.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <button
            onClick={() => setShowPastOrders(!showPastOrders)}
            className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">📋</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Past Orders ({sortedPastOrders.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Orders from previous days
                  </p>
                </div>
              </div>
              <div className="text-gray-400">
                {showPastOrders ? (
                  <svg
                    className="w-5 h-5 transform transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 transform transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {showPastOrders && (
            <div className="border-t border-gray-200 space-y-3 sm:space-y-4 p-4 sm:p-6">
              {sortedPastOrders.map((order) => {
                const timeStatus = getTimeStatus(
                  order.estimatedDelivery,
                  order.status
                );
                return (
                  <div
                    key={order.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Mobile: Stack vertically, Desktop: Side by side */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 border-2 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            <span className="text-lg sm:text-xl">
                              {getStatusIcon(order.status)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              #{order.orderId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {order.createdAt.toLocaleDateString()} at{" "}
                              {order.createdAt.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:self-auto">
                          <div className="sm:hidden text-xs text-gray-500 mb-1">
                            Status:
                          </div>
                          <div
                            className={`inline-flex items-center px-3 py-2 sm:py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            <span className="mr-2">
                              {getStatusIcon(order.status)}
                            </span>
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile: Stack all info, Desktop: 3 columns */}
                      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Platform</p>
                          <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                              🍕 Zomato
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Estimated Delivery
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
                            {order.estimatedDelivery.toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div
                            className={`flex items-center mt-1 ${timeStatus.color}`}
                          >
                            <span className="mr-1">{timeStatus.icon}</span>
                            <span className="font-medium text-sm">
                              {timeStatus.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button for Past Orders */}
                      {onDeleteOrder && (
                        <div className="flex justify-end pt-3 mt-3 border-t border-gray-200">
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                orderId: order.id,
                                orderNumber: order.orderId,
                              })
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Order
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete order{" "}
                <span className="font-semibold">
                  #{deleteConfirmation.orderNumber}
                </span>
                ? This will permanently remove the order from your list and the
                tracking system.
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDeleteOrder) {
                      // first delete the order from localStorage references
                      const storedRefs = localStorage.getItem("myOrderIds");
                      if (storedRefs) {
                        const allRefs: StoredOrder[] = JSON.parse(storedRefs);
                        const updatedRefs = allRefs.filter(
                          (ref) => ref.id !== deleteConfirmation.orderNumber
                        );
                        localStorage.setItem(
                          "myOrderIds",
                          JSON.stringify(updatedRefs)
                        );
                      }

                      // then call the delete function
                      onDeleteOrder(deleteConfirmation.orderId);
                    }
                    setDeleteConfirmation(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

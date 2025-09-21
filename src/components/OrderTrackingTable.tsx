import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "../types/Order";

interface OrderTrackingTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

const OrderTrackingTable: React.FC<OrderTrackingTableProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<
    "estimatedDelivery" | "createdAt" | "status" | "orderId" | "employeeName"
  >("estimatedDelivery");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const filteredAndSortedOrders = useMemo(() => {
    // Filter by status if needed
    let filtered = orders;
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      // Always prioritize not-delivered orders (ordered and collected)
      const aNotDelivered = a.status === "ordered" || a.status === "collected";
      const bNotDelivered = b.status === "ordered" || b.status === "collected";

      if (aNotDelivered && !bNotDelivered) return -1;
      if (!aNotDelivered && bNotDelivered) return 1;

      // Then sort by the selected criteria
      if (sortBy === "estimatedDelivery") {
        return (
          new Date(a.estimatedDelivery).getTime() -
          new Date(b.estimatedDelivery).getTime()
        );
      } else if (sortBy === "createdAt") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return a.status.localeCompare(b.status);
      }
    });
  }, [orders, filterStatus, sortBy]);

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      ordered: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "📱",
        text: "Ordered",
      },
      collected: {
        color: "bg-blue-100 text-blue-800",
        icon: "🚚",
        text: "Collected",
      },
      arrived: {
        color: "bg-green-100 text-green-800",
        icon: "✅",
        text: "Arrived",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit md:w-auto ${
          status === "ordered"
            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
            : status === "collected"
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
            : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
        }`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getTimeStatus = (estimatedDelivery: Date, status: OrderStatus) => {
    // For completed orders, show their status
    if (status === "collected") {
      return { text: "Completed", color: "text-green-600 dark:text-green-400" };
    }

    // For arrived orders, show arrived status
    if (status === "arrived") {
      return { text: "Arrived", color: "text-blue-600 dark:text-blue-400" };
    }

    // Only calculate time differences for orders that are still in progress
    const now = new Date();
    const timeDiff = estimatedDelivery.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff < 0) {
      return {
        text: `${Math.abs(minutesDiff)} min overdue`,
        color: "text-red-600 dark:text-red-400 font-semibold",
      };
    } else if (minutesDiff <= 10) {
      return {
        text: `${minutesDiff} min remaining`,
        color: "text-orange-600 dark:text-orange-400 font-medium",
      };
    } else {
      return {
        text: `${minutesDiff} min remaining`,
        color: "text-gray-600 dark:text-gray-400",
      };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="px-3 space-y-4 sm:space-y-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full sm:w-10 sm:h-10 dark:bg-blue-900/50">
              <span className="text-lg text-blue-600 dark:text-blue-400 sm:text-xl">
                📊
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Today's Orders
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Track and manage today's food orders
              </p>
              <p className="text-xs text-gray-400 sm:text-sm dark:text-gray-500">
                Arrived order always appear at bottom(unsorted)
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
            <div className="px-2 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 sm:px-4">
              <div className="text-lg font-bold text-yellow-800 sm:text-xl dark:text-yellow-300">
                {orders.filter((o) => o.status === "ordered").length}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Ordered
              </div>
            </div>
            <div className="px-2 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 sm:px-4">
              <div className="text-lg font-bold text-blue-800 sm:text-xl dark:text-blue-300">
                {orders.filter((o) => o.status === "collected").length}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Collected
              </div>
            </div>
            <div className="px-2 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 sm:px-4">
              <div className="text-lg font-bold text-green-800 sm:text-xl dark:text-green-300">
                {orders.filter((o) => o.status === "arrived").length}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Arrived
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 sm:p-6 dark:border-gray-700">
        <div className="flex flex-col gap-4 space-y-4 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-auto">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as OrderStatus | "all")
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="ordered">Ordered</option>
                <option value="collected">Collected</option>
                <option value="arrived">Arrived</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "estimatedDelivery"
                      | "createdAt"
                      | "status"
                      | "orderId"
                      | "employeeName"
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="estimatedDelivery">Delivery Time (ASC)</option>
                <option value="createdAt">Order Time (DESC)</option>
                <option value="status">Status (ASC)</option>
                <option value="orderId">Order Id (ASC)</option>
                <option value="employeeName">Employee Name (ASC)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-center text-gray-600 sm:text-right">
            Showing {filteredAndSortedOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm dark:bg-gray-800 sm:p-12">
          <div className="mb-4 text-4xl text-gray-400 sm:text-6xl">🍽️</div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No orders found
          </h3>
          <p className="text-gray-500">No orders match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedOrders.map((order) => {
            const timeStatus = getTimeStatus(
              order.estimatedDelivery,
              order.status
            );
            return (
              <div
                key={order.id}
                className="overflow-hidden transition-shadow bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md"
              >
                <div className="p-4 sm:p-6">
                  {/* Mobile: Stack vertically, Desktop: Grid layout */}
                  <div className="flex flex-col space-y-4 sm:grid sm:grid-cols-4 sm:gap-6 sm:space-y-0">
                    {/* Employee Info */}
                    <div className="flex items-center sm:col-span-1">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-3 bg-purple-100 rounded-full dark:bg-purple-900/50">
                        <span className="text-lg text-purple-600 dark:text-purple-400">
                          👤
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {order.employeeName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                          {order.phoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="sm:col-span-1">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.orderId}
                          </span>
                        </div>
                        {order.platform && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded dark:bg-red-900/50 dark:text-red-300">
                              🍕 {order.platform}
                            </span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {order.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timing Info */}
                    <div className="sm:col-span-1">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Estimated Delivery
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatTime(order.estimatedDelivery)} 🛵
                        </div>
                        <div className={`text-xs ${timeStatus.color}`}>
                          {timeStatus.text}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Ordered: {formatTime(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col space-y-3 sm:col-span-1 sm:items-end">
                      {/* Status Badge */}
                      <div className="flex flex-col space-y-1 sm:items-end">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Status:
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2">
                        {order.status === "ordered" && (
                          <button
                            onClick={() =>
                              onUpdateStatus(order.id, "collected")
                            }
                            className="px-3 py-2 text-xs font-medium text-blue-700 transition-colors bg-blue-100 rounded-md dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50"
                          >
                            Mark Collected
                          </button>
                        )}
                        {order.status === "collected" && (
                          <button
                            onClick={() => onUpdateStatus(order.id, "arrived")}
                            className="px-3 py-2 text-xs font-medium text-green-700 transition-colors bg-green-100 rounded-md dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
                          >
                            Mark Arrived
                          </button>
                        )}
                        {/* <button
                          onClick={() =>
                            setDeleteConfirmation({
                              orderId: order.id,
                              orderNumber: order.orderId,
                            })
                          }
                          className="px-3 py-2 text-xs font-medium text-red-700 transition-colors bg-red-100 rounded-md hover:bg-red-200"
                        >
                          🗑️
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-red-100 rounded-full dark:bg-red-900/50">
                  <span className="text-xl text-red-600 dark:text-red-400">
                    ⚠️
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Order
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete order{" "}
                <span className="font-semibold">
                  #{deleteConfirmation.orderNumber}
                </span>
                ? This will permanently remove the order from the system.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-md dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteOrder(deleteConfirmation.orderId);
                    setDeleteConfirmation(null);
                  }}
                  className="px-4 py-2 font-medium text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
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

export default OrderTrackingTable;

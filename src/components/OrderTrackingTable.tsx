import { useState, useMemo } from "react";
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
    "estimatedDelivery" | "createdAt" | "status"
  >("estimatedDelivery");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    if (filterStatus !== "all") {
      filtered = orders.filter((order) => order.status === filterStatus);
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit md:w-auto ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getTimeStatus = (estimatedDelivery: Date, status: OrderStatus) => {
    const now = new Date();
    const timeDiff = estimatedDelivery.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (status === "collected") {
      return { text: "Completed", color: "text-green-600" };
    }

    if (minutesDiff < 0) {
      return {
        text: `${Math.abs(minutesDiff)} min overdue`,
        color: "text-red-600 font-semibold",
      };
    } else if (minutesDiff <= 10) {
      return {
        text: `${minutesDiff} min remaining`,
        color: "text-orange-600 font-medium",
      };
    } else {
      return { text: `${minutesDiff} min remaining`, color: "text-gray-600" };
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
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg sm:text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Order Tracking
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor all food orders and their status
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="bg-yellow-50 px-2 sm:px-4 py-2 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-yellow-800">
                {orders.filter((o) => o.status === "ordered").length}
              </div>
              <div className="text-xs text-yellow-600">Ordered</div>
            </div>
            <div className="bg-blue-50 px-2 sm:px-4 py-2 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-800">
                {orders.filter((o) => o.status === "collected").length}
              </div>
              <div className="text-xs text-blue-600">Collected</div>
            </div>
            <div className="bg-green-50 px-2 sm:px-4 py-2 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-800">
                {orders.filter((o) => o.status === "arrived").length}
              </div>
              <div className="text-xs text-green-600">Arrived</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as OrderStatus | "all")
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="ordered">Ordered</option>
                <option value="collected">Collected</option>
                <option value="arrived">Arrived</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  )
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="estimatedDelivery">Delivery Time</option>
                <option value="createdAt">Order Time</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-center sm:text-right">
            Showing {filteredAndSortedOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
                className="bg-white shadow-sm rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  {/* Mobile: Stack vertically, Desktop: Grid layout */}
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:gap-6 space-y-4 sm:space-y-0">
                    {/* Employee Info */}
                    <div className="flex items-center sm:col-span-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-600 text-lg">👤</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {order.employeeName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {order.phoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="sm:col-span-1">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            #{order.orderId}
                          </span>
                        </div>
                        {order.platform && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              🍕 {order.platform}
                            </span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-xs text-gray-400 mt-1">
                            {order.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timing Info */}
                    <div className="sm:col-span-1">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          Estimated Delivery
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(order.estimatedDelivery)}
                        </div>
                        <div className={`text-xs ${timeStatus.color}`}>
                          {timeStatus.text}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ordered: {formatTime(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="sm:col-span-1 flex flex-col sm:items-end space-y-3">
                      {/* Status Badge */}
                      <div className="flex flex-col sm:items-end space-y-1">
                        <div className="text-xs text-gray-500">Status:</div>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2">
                        {order.status === "ordered" && (
                          <button
                            onClick={() =>
                              onUpdateStatus(order.id, "collected")
                            }
                            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            Mark Collected
                          </button>
                        )}
                        {order.status === "collected" && (
                          <button
                            onClick={() => onUpdateStatus(order.id, "arrived")}
                            className="bg-green-100 text-green-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            Mark Arrived
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              orderId: order.id,
                              orderNumber: order.orderId,
                            })
                          }
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>
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
                ? This will permanently remove the order from the system.
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
                    onDeleteOrder(deleteConfirmation.orderId);
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

export default OrderTrackingTable;

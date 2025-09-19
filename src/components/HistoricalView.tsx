import { useState, useMemo } from "react";
import type { Order } from "../types/Order";

interface HistoricalViewProps {
  orders: Order[];
}

const HistoricalView: React.FC<HistoricalViewProps> = ({ orders }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const filteredOrders = useMemo(() => {
    const selected = new Date(selectedDate);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (viewMode === "day") {
        return orderDate.toDateString() === selected.toDateString();
      } else if (viewMode === "week") {
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - selected.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return orderDate >= weekStart && orderDate <= weekEnd;
      } else {
        // month
        return (
          orderDate.getMonth() === selected.getMonth() &&
          orderDate.getFullYear() === selected.getFullYear()
        );
      }
    });
  }, [orders, selectedDate, viewMode]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(
      (o) => o.status === "collected"
    ).length;
    const pending = filteredOrders.filter(
      (o) => o.status !== "collected"
    ).length;
    const platforms = filteredOrders.reduce((acc, order) => {
      if (order.platform) {
        acc[order.platform] = (acc[order.platform] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, completed, pending, platforms };
  }, [filteredOrders]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDateRangeText = () => {
    const selected = new Date(selectedDate);

    if (viewMode === "day") {
      return formatDate(selectedDate);
    } else if (viewMode === "week") {
      const weekStart = new Date(selected);
      weekStart.setDate(selected.getDate() - selected.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    } else {
      return selected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 text-xl">📈</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Historical Data
            </h2>
            <p className="text-gray-600">View past orders and analytics</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Mode
              </label>
              <div className="flex space-x-1">
                {(["day", "week", "month"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                      viewMode === mode
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">{getDateRangeText()}</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-lg">⏳</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg">📈</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {Object.keys(stats.platforms).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders by Platform
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.platforms).map(([platform, count]) => (
              <div key={platform} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{platform}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              No orders were placed on the selected date(s).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderId}
                          </div>
                          {order.platform && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {order.platform}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {order.createdAt.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            ETA:{" "}
                            {order.estimatedDelivery.toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "collected"
                              ? "bg-green-100 text-green-800"
                              : order.status === "arrived"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status === "collected" && "✅ Collected"}
                          {order.status === "arrived" && "🚚 Arrived"}
                          {order.status === "ordered" && "📱 Ordered"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalView;

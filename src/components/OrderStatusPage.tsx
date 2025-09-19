import { useState, useEffect } from "react";
import type { Order } from "../types/Order";

interface OrderStatusPageProps {
  orderId: string;
  orders: Order[];
  onBackToForm: () => void;
  onUpdateStatus: (
    orderId: string,
    status: "ordered" | "arrived" | "collected"
  ) => void;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
  orderId,
  orders,
  onBackToForm,
  onUpdateStatus,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    const order = orders.find((o) => o.id === orderId);
    setCurrentOrder(order || null);
  }, [orderId, orders]);

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-red-700 mb-4">
            Could not find order with ID: {orderId}
          </p>
          <button
            onClick={onBackToForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered":
        return "📱";
      case "arrived":
        return "🚚";
      case "collected":
        return "✅";
      default:
        return "📱";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "arrived":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "collected":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeStatus = () => {
    const now = new Date();
    const timeDiff = currentOrder.estimatedDelivery.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (currentOrder.status === "collected") {
      return { text: "Order Completed!", color: "text-green-600", icon: "🎉" };
    }

    if (minutesDiff < 0) {
      return {
        text: `${Math.abs(minutesDiff)} minutes overdue`,
        color: "text-red-600 font-semibold",
        icon: "⚠️",
      };
    } else if (minutesDiff <= 10) {
      return {
        text: `Arriving in ${minutesDiff} minutes`,
        color: "text-orange-600 font-medium",
        icon: "🕐",
      };
    } else {
      return {
        text: `Expected in ${minutesDiff} minutes`,
        color: "text-gray-600",
        icon: "⏰",
      };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Status</h2>
              <p className="text-gray-600">Track your Zomato order</p>
            </div>
          </div>
          <button
            onClick={onBackToForm}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold text-lg">#{currentOrder.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform</p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-red-100 text-red-800">
                  🍕 Zomato
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{currentOrder.employeeName}</p>
              <p className="text-sm text-gray-500">
                {currentOrder.phoneNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-medium">
                {currentOrder.estimatedDelivery.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Order Progress
          </h3>

          <div className="flex items-center space-x-4">
            {/* Ordered */}
            <div
              className={`flex-1 p-4 rounded-lg border-2 ${
                currentOrder.status === "ordered"
                  ? getStatusColor("ordered")
                  : currentOrder.status === "arrived" ||
                    currentOrder.status === "collected"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">Ordered</div>
                <div className="text-xs">
                  {currentOrder.createdAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>

            <div className="text-gray-400">→</div>

            {/* Arrived */}
            <div
              className={`flex-1 p-4 rounded-lg border-2 ${
                currentOrder.status === "arrived"
                  ? getStatusColor("arrived")
                  : currentOrder.status === "collected"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <div className="font-medium">Arrived</div>
                <div className="text-xs">
                  {currentOrder.status === "arrived" ||
                  currentOrder.status === "collected"
                    ? "At Office"
                    : "Pending"}
                </div>
              </div>
            </div>

            <div className="text-gray-400">→</div>

            {/* Collected */}
            <div
              className={`flex-1 p-4 rounded-lg border-2 ${
                currentOrder.status === "collected"
                  ? getStatusColor("collected")
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="font-medium">Collected</div>
                <div className="text-xs">
                  {currentOrder.status === "collected" ? "Complete" : "Pending"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{timeStatus.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">Current Status</p>
                <p className={`${timeStatus.color}`}>{timeStatus.text}</p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full border-2 ${getStatusColor(
                currentOrder.status
              )}`}
            >
              <span className="mr-2">{getStatusIcon(currentOrder.status)}</span>
              <span className="font-medium capitalize">
                {currentOrder.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions for Guards/Staff */}
        {currentOrder.status !== "collected" && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-3">
              <strong>For Security/Staff:</strong> Update order status when
              applicable
            </p>
            <div className="flex space-x-3">
              {currentOrder.status === "ordered" && (
                <button
                  onClick={() => onUpdateStatus(currentOrder.id, "arrived")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  🚚 Mark as Arrived
                </button>
              )}
              {currentOrder.status === "arrived" && (
                <button
                  onClick={() => onUpdateStatus(currentOrder.id, "collected")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  ✅ Mark as Collected
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {currentOrder.status === "collected" && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-green-800 font-semibold">
                Order Successfully Collected!
              </p>
              <p className="text-green-600 text-sm mt-1">Enjoy your meal!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;

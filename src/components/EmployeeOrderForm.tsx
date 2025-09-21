import { useState, useEffect } from "react";
import type { Order } from "../types/Order";

interface EmployeeOrderFormProps {
  onAddOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<void>;
  onOrderSubmitted?: (orderId: string) => void;
}

const currentDayName = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
][new Date().getDay()];
const EmployeeOrderForm: React.FC<EmployeeOrderFormProps> = ({
  onAddOrder,
  onOrderSubmitted,
}) => {
  const [formData, setFormData] = useState({
    employeeName: "",
    phoneNumber: "",
    orderId: "",
    estimatedDeliveryTime: "",
  });

  const [isTimeRestricted, setIsTimeRestricted] = useState(false);

  // Check if current time is within allowed hours (11:30 AM - 2:00 PM on weekdays)
  useEffect(() => {
    const checkTimeRestriction = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour + minute / 60;

      //Check if it's a weekday (Monday to Friday)
      const isWeekday = day >= 1 && day <= 5;

      //Check if time is between 11:30 AM (11.5) and 2:00 PM (14.0)
      const isWithinTimeRange = currentTime >= 11.5 && currentTime <= 14.0;

      setIsTimeRestricted(!(isWeekday && isWithinTimeRange));
    };

    checkTimeRestriction();
    const interval = setInterval(checkTimeRestriction, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Load saved employee data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("employeeName");
    const savedPhone = localStorage.getItem("employeePhone");

    if (savedName) {
      setFormData((prev) => ({ ...prev, employeeName: savedName }));
    }
    if (savedPhone) {
      setFormData((prev) => ({ ...prev, phoneNumber: savedPhone }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isTimeRestricted) {
      alert(
        "Orders can only be placed on weekdays between 11:30 AM and 2:00 PM"
      );
      return;
    }

    // Save employee data to localStorage for future use
    localStorage.setItem("employeeName", formData.employeeName);
    localStorage.setItem("employeePhone", formData.phoneNumber);

    // Combine current date with selected time
    const today = new Date();
    const [hours, minutes] = formData.estimatedDeliveryTime.split(":");
    const estimatedDelivery = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );

    const newOrder = {
      employeeName: formData.employeeName,
      phoneNumber: formData.phoneNumber,
      orderId: formData.orderId,
      estimatedDelivery,
      status: "ordered" as const,
      platform: "Zomato",
    };

    // Save order reference to localStorage with a unique key for current user
    const myOrders = JSON.parse(localStorage.getItem("myOrderIds") || "[]");
    myOrders.unshift({
      id: formData.orderId,
      date: today.toISOString(),
      employeeName: formData.employeeName, // Add employee name for reference
    });
    // Keep only last 20 orders
    if (myOrders.length > 20) {
      myOrders.pop();
    }
    localStorage.setItem("myOrderIds", JSON.stringify(myOrders));

    onAddOrder(newOrder).then(() => {
      // Navigate to order status page
      if (onOrderSubmitted) {
        onOrderSubmitted(formData.orderId);
      }
    });

    // Reset form (but keep employee data)
    setFormData((prev) => ({
      ...prev,
      orderId: "",
      estimatedDeliveryTime: "",
    }));
  };

  if (isTimeRestricted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <div className="text-yellow-600 dark:text-yellow-500 text-4xl mb-4">
            ⏰
          </div>
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Order Placement Restricted
          </h2>
          <p className="text-yellow-700 dark:text-yellow-200">
            Orders can only be placed on weekdays between 11:30 AM and 2:00 PM.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            Current date and time: {new Date().toLocaleString()} -{" "}
            {currentDayName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 dark:text-green-400 text-xl">
              📱
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Order Details
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Add your Zomato order details for pickup tracking
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="employeeName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Employee Name *
              </label>
              <input
                type="text"
                id="employeeName"
                required
                value={formData.employeeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="orderId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Zomato Order ID *
              </label>
              <div className="text-xs text-gray-500 -mt-1 mb-1 invisible">
                &nbsp;
              </div>
              <input
                type="text"
                id="orderId"
                required
                value={formData.orderId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, orderId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="e.g., ZOM123456"
              />
            </div>

            <div>
              <label
                htmlFor="estimatedDeliveryTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Estimated Delivery Time *
              </label>
              <div className="text-xs text-gray-500 -mt-1 mb-1">
                Today - {new Date().toLocaleDateString()}
              </div>
              <input
                type="time"
                id="estimatedDeliveryTime"
                required
                value={formData.estimatedDeliveryTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedDeliveryTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  employeeName: localStorage.getItem("employeeName") || "",
                  phoneNumber: localStorage.getItem("employeePhone") || "",
                  orderId: "",
                  estimatedDeliveryTime: "",
                })
              }
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeOrderForm;

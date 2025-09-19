export type OrderStatus = "ordered" | "arrived" | "collected";

export interface Order {
  id: string;
  employeeName: string;
  phoneNumber: string;
  orderId: string;
  estimatedDelivery: Date;
  status: OrderStatus;
  createdAt: Date;
  platform?: string;
  notes?: string;
}

export interface EmployeeData {
  name: string;
  phoneNumber: string;
}

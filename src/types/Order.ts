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

export interface SupabaseOrder {
  id: string;
  employee_name: string;
  phone_number: string;
  order_id: string;
  estimated_delivery: string;
  status: OrderStatus;
  created_at: string;
  platform: string;
}

export interface EmployeeData {
  name: string;
  phoneNumber: string;
}

export function map(o: SupabaseOrder): Order {
  return {
    id: o.id,
    employeeName: o.employee_name,
    phoneNumber: o.phone_number,
    orderId: o.order_id,
    estimatedDelivery: new Date(o.estimated_delivery),
    status: o.status,
    createdAt: new Date(o.created_at),
    platform: o.platform,
  };
}
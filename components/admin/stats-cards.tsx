import { formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Package, Users } from "lucide-react";

interface StatsCardsProps {
  revenue: number;
  orderCount: number;
  productCount: number;
  pendingCount: number;
}

export function StatsCards({
  revenue,
  orderCount,
  productCount,
  pendingCount,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(revenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: orderCount.toString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Products",
      value: productCount.toString(),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Pending Orders",
      value: pendingCount.toString(),
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
            <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900 font-poppins">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

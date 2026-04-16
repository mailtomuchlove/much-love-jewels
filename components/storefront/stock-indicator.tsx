import { STOCK_LOW_THRESHOLD } from "@/utils/constants";

interface StockIndicatorProps {
  stock: number;
  className?: string;
}

export function StockIndicator({ stock, className }: StockIndicatorProps) {
  if (stock === 0) {
    return (
      <span className={`badge-stock-low ${className ?? ""}`}>
        Out of Stock
      </span>
    );
  }
  if (stock <= STOCK_LOW_THRESHOLD) {
    return (
      <span className={`badge-stock-low ${className ?? ""}`}>
        Only {stock} left — order soon!
      </span>
    );
  }
  return (
    <span className={`badge-stock-ok ${className ?? ""}`}>
      In Stock
    </span>
  );
}

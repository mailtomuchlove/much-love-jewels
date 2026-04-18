-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- This replaces the unbounded SELECT on orders in the admin dashboard with an aggregate.

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_revenue',  COALESCE(SUM(total_paise) FILTER (WHERE payment_status = 'paid'), 0),
    'total_orders',   COUNT(*),
    'pending_count',  COUNT(*) FILTER (WHERE status = 'pending')
  )
  FROM orders;
$$;

-- Grant execute to the authenticated and anon roles used by Supabase clients
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon;

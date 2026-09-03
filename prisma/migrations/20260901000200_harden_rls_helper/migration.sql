-- Security advisor 0028/0029: the pre-existing helper public.rls_auto_enable()
-- (a SECURITY DEFINER event-trigger function that auto-enables RLS on new tables)
-- was callable by the anon / authenticated roles via PostgREST RPC.
--
-- Revoke that EXECUTE grant. Event triggers fire regardless of EXECUTE
-- privileges, so the auto-enable-RLS behaviour is preserved; only the remote
-- RPC attack surface is removed. Reversible with GRANT EXECUTE ... .
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;

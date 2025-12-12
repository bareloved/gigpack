-- Add RLS policy to allow anonymous users to subscribe to realtime updates
-- for public (non-archived) gig packs only

-- This policy allows anonymous users to receive realtime updates for gig packs
-- that are public (not archived) and don't contain sensitive information
CREATE POLICY "Anonymous users can subscribe to public gig pack updates"
  ON public.gig_packs
  FOR SELECT
  USING (is_archived = false AND internal_notes IS NULL);

-- Note: This policy is very restrictive - it only allows access to gig packs
-- that are not archived AND have no internal notes. This ensures that
-- sensitive data is never exposed via realtime subscriptions.

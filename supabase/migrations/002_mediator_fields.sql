-- Add mediator fields to requests table

ALTER TABLE public.requests
ADD COLUMN mediator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN pickup_code TEXT,
ADD COLUMN delivery_code TEXT;

-- Update RLS policies to allow mediators to view and update requests they are assigned to
CREATE POLICY "Requests: mediators can read assigned"
  ON public.requests FOR SELECT
  TO authenticated
  USING (auth.uid() = mediator_id);

CREATE POLICY "Requests: mediators can update assigned"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = mediator_id OR status = 'pending')
  WITH CHECK (auth.uid() = mediator_id);

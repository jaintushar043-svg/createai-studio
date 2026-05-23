CREATE POLICY "users insert own pending orders"
ON public.payment_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending' AND provider = 'razorpay_manual');
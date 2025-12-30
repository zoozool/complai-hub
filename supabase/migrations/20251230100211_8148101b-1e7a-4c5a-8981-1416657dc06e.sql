-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'main_administrator'::app_role));

-- Allow admins to delete user roles (already covered by "Admins can manage roles" policy with ALL command)
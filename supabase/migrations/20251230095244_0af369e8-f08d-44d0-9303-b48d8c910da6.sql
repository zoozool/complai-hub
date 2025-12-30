INSERT INTO public.user_roles (user_id, role)
VALUES ('4f6443ee-b599-43f1-a45a-28accc1785f4', 'main_administrator')
ON CONFLICT (user_id, role) DO NOTHING;
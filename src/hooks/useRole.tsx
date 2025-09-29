import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'main_administrator' | 'employee' | 'service_technician' | null;

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          setRole(data?.role || null);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRole();
    }
  }, [user, authLoading]);

  const hasRole = (requiredRole: UserRole) => {
    return role === requiredRole;
  };

  const isAdmin = () => hasRole('main_administrator');
  const isEmployee = () => hasRole('employee');
  const isTechnician = () => hasRole('service_technician');

  return {
    role,
    loading: loading || authLoading,
    hasRole,
    isAdmin,
    isEmployee,
    isTechnician,
  };
}
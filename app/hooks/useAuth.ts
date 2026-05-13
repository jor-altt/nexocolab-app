import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    // Verificar sesión inicial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          console.log('🔍 Sesión inicial:', session ? 'AUTENTICADO' : 'NO autenticado');
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        console.log('🔄 onAuthStateChange evento:', event);
        console.log('📌 Nueva sesión:', session ? 'AUTENTICADO' : 'NO autenticado');
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return isAuthenticated;
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ToastNotification } from "./ToastNotification";

export function AdminActivityListener() {
  const [toast, setToast] = useState<{ title: string; message: string; id: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let subscription: any = null;

    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'ADMIN') return;

      // Subscribe to all inserts on activity_logs
      subscription = supabase
        .channel('admin-activity')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activity_logs' },
          async (payload) => {
            const newLog = payload.new;
            
            // On ne s'auto-notifie pas si c'est l'admin qui fait l'action
            if (newLog.user_id === user.id) return;

            // Récupérer le nom de l'employé
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newLog.user_id)
              .single();

            const empName = userProfile?.full_name || "Un employé";

            let title = "Nouvelle Action";
            if (newLog.action_type === 'LOGIN') title = "Connexion Système";
            if (newLog.action_type === 'CREATE_INVOICE') title = "Facture Créée";

            setToast({
              id: Date.now().toString(),
              title: title,
              message: `${empName} : ${newLog.details}`
            });
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  if (!toast) return null;

  return (
    <ToastNotification
      title={toast.title}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  );
}

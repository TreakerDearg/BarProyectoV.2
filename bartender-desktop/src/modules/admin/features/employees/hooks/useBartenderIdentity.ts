/**
 * BARTENDER IDENTITY HOOK
 * Hook para integración nativa con Bartender Identity
 * Consume Identity Status, Sessions, Devices, Activity Logs, Permissions, Roles
 */

import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";

interface IdentityStatus {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "locked";
  isEmployee: boolean;
  shift: string | null;
  isActive: boolean;
  isLocked: boolean;
  lockedUntil: Date | null;
  permissions: Record<string, boolean>;
  lastLogin: Date | null;
  loginAttempts: number;
}

interface IdentitySession {
  sessionId: string;
  userId: string;
  platform: "web" | "desktop" | "mobile" | "admin";
  device: {
    type: "desktop" | "mobile" | "tablet";
    name: string;
    os: string;
    browser: string;
    userAgent: string;
  };
  location: {
    ip: string;
    country: string;
    city: string;
  };
  timestamps: {
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
  };
  status: "active" | "inactive" | "expired" | "revoked";
}

interface IdentityDevice {
  deviceId: string;
  userId: string;
  platform: string;
  deviceType: string;
  browser: string;
  os: string;
  appVersion: string;
  deviceName: string;
  ipAddress: string;
  lastActivity: Date;
  isActive: boolean;
  isRevoked: boolean;
}

interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  activityType: string;
  description: string;
  metadata: Record<string, any>;
  shift: string | null;
  duration: number;
  timestamp: Date;
}

interface UseBartenderIdentityOptions {
  autoFetch?: boolean;
  userId?: string;
}

interface UseBartenderIdentityReturn {
  identityStatus: IdentityStatus | null;
  sessions: IdentitySession[];
  devices: IdentityDevice[];
  activityLogs: ActivityLogEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
}

export function useBartenderIdentity(
  options: UseBartenderIdentityOptions = {}
): UseBartenderIdentityReturn {
  const { autoFetch = true, userId } = options;

  const [identityStatus, setIdentityStatus] = useState<IdentityStatus | null>(null);
  const [sessions, setSessions] = useState<IdentitySession[]>([]);
  const [devices, setDevices] = useState<IdentityDevice[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentityStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/identity/status/${userId}`);
      setIdentityStatus(response.data);
    } catch (err) {
      console.error("Error fetching identity status:", err);
    }
  }, [userId]);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/identity/sessions/${userId}`);
      setSessions(response.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, [userId]);

  const fetchDevices = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/identity/devices/${userId}`);
      setDevices(response.data);
    } catch (err) {
      console.error("Error fetching devices:", err);
    }
  }, [userId]);

  const fetchActivityLogs = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/identity/activity/${userId}`, {
        params: { limit: 50 },
      });
      setActivityLogs(response.data);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchIdentityStatus(),
        fetchSessions(),
        fetchDevices(),
        fetchActivityLogs(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos de identidad");
    } finally {
      setLoading(false);
    }
  }, [fetchIdentityStatus, fetchSessions, fetchDevices, fetchActivityLogs]);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      await api.post(`/identity/sessions/${sessionId}/revoke`);
      await fetchSessions();
    } catch (err) {
      throw new Error("Error al revocar sesión");
    }
  }, [fetchSessions]);

  const revokeAllSessions = useCallback(async () => {
    if (!userId) return;

    try {
      await api.post(`/identity/sessions/${userId}/revoke-all`);
      await fetchSessions();
    } catch (err) {
      throw new Error("Error al revocar todas las sesiones");
    }
  }, [userId, fetchSessions]);

  const revokeDevice = useCallback(async (deviceId: string) => {
    try {
      await api.post(`/identity/devices/${deviceId}/revoke`);
      await fetchDevices();
    } catch (err) {
      throw new Error("Error al revocar dispositivo");
    }
  }, [fetchDevices]);

  useEffect(() => {
    if (autoFetch && userId) {
      refresh();
    }
  }, [autoFetch, userId, refresh]);

  return {
    identityStatus,
    sessions,
    devices,
    activityLogs,
    loading,
    error,
    refresh,
    revokeSession,
    revokeAllSessions,
    revokeDevice,
  };
}

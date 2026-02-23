import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Task 3: Socket connection initialization
const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : window.location.origin;

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [smsLogs, setSmsLogs] = useState([]);
    const [devices, setDevices] = useState([]);
    const [configUrl, setConfigUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastLogId, setLastLogId] = useState(null);

    // --- Browser Notification Permission ---
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // Task 3: Setup Socket.io Listener
    useEffect(() => {
        if (!user) return;

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('[SOCKET] Connected to server');
        });

        socket.on('new_sms', (newSms) => {
            console.log('[SOCKET] New SMS received:', newSms);

            // 1. Update Logs List (Instant show)
            setSmsLogs(prev => {
                // Deduplication check on client side just in case
                if (prev.some(log => log._id === newSms._id)) return prev;
                return [newSms, ...prev];
            });

            // 2. Trigger Notification
            if ('Notification' in window && Notification.permission === 'granted' && (document.hidden || !document.hasFocus())) {
                new Notification(`New Message from ${newSms.device_name || 'Device'}`, {
                    body: `${newSms.sender}: ${newSms.message_body}`,
                    icon: '/logo.png'
                });
            }

            // 3. Update related device last_seen if visible
            setDevices(prev => prev.map(d =>
                d.device_id === newSms.device_id
                    ? { ...d, last_seen: new Date().toISOString(), is_online: true }
                    : d
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const fetchData = useCallback(async (isBackground = false) => {
        if (!user) return; // Don't fetch if not logged in
        if (!isBackground) setLoading(true);
        try {
            const [logsRes, devicesRes, configRes] = await Promise.all([
                api.get('/sms'),
                api.get('/device'),
                api.get('/config/WEBSITE_URL').catch(() => ({ data: { value: "" } }))
            ]);

            setSmsLogs(logsRes.data);
            setDevices(devicesRes.data);
            setConfigUrl(configRes.data.value || "");

            if (logsRes.data.length > 0) {
                setLastLogId(logsRes.data[0]._id);
            }
        } catch (err) {
            console.error("Fetch error", err);
            if (!isBackground) toast.error("Failed to fetch data");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000); // Polling reduced as backup
        return () => clearInterval(interval);
    }, [fetchData]);

    const refreshData = () => fetchData(true);

    const updateConfig = async (newUrl) => {
        try {
            await api.put('/config', { key: 'WEBSITE_URL', value: newUrl });
            setConfigUrl(newUrl);
            toast.success("Synchronized successfully");
            return true;
        } catch (err) {
            toast.error("Sync failed");
            return false;
        }
    };

    const renameDevice = async (deviceId, newName) => {
        try {
            await api.put(`/device/${deviceId}`, { name: newName });
            toast.success("Device renamed successfully");
            fetchData(true);
            return true;
        } catch (err) {
            toast.error("Failed to rename device");
            return false;
        }
    };

    const clearLogs = async (deviceId) => {
        try {
            await api.delete(`/sms/${deviceId}`);
            toast.success("Logs cleared successfully");
            setSmsLogs(prev => prev.filter(log => log.device_id !== deviceId));
            return true;
        } catch (err) {
            toast.error("Failed to clear logs");
            return false;
        }
    };

    const deleteDevice = async (deviceId) => {
        try {
            await api.delete(`/device/${deviceId}`);
            toast.success("Device and its logs removed successfully");
            setDevices(prev => prev.filter(d => d.device_id !== deviceId));
            setSmsLogs(prev => prev.filter(log => log.device_id !== deviceId));
            return true;
        } catch (err) {
            toast.error("Failed to delete device");
            return false;
        }
    };

    return (
        <DataContext.Provider value={{
            smsLogs,
            devices,
            configUrl,
            loading,
            fetchData,
            refreshData,
            updateConfig,
            renameDevice,
            clearLogs,
            deleteDevice
        }}>
            {children}
        </DataContext.Provider>
    );
};

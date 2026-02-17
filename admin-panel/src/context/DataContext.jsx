import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
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

    const fetchData = useCallback(async (isBackground = false) => {
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

            // Notification Logic
            const latestLogs = logsRes.data;
            if (latestLogs.length > 0) {
                const latestLog = latestLogs[0];
                if (lastLogId && latestLog._id !== lastLogId) {
                    // Notify if hidden or tab not focused
                    if ('Notification' in window && Notification.permission === 'granted' && (document.hidden || !document.hasFocus())) {
                        const deviceName = devicesRes.data.find(d => d.device_id === latestLog.device_id)?.model || 'Unknown Device';
                        new Notification(`New Message from ${deviceName}`, {
                            body: `${latestLog.sender}: ${latestLog.message_body}`,
                            icon: '/logo.png'
                        });
                    }
                }
                setLastLogId(latestLog._id);

            }
        } catch (err) {
            console.error("Fetch error", err);
            if (!isBackground) toast.error("Failed to fetch data");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [lastLogId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 15000); // Global refresh every 15s
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
            clearLogs
        }}>
            {children}
        </DataContext.Provider>
    );
};

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CompanySettings {
    companyName: string;
    cnpj: string;
    email: string;
    phone: string;
}

interface CommissionSettings {
    seguradoraPercent: number;
    techfinancePercent: number;
    redePercent: number;
}

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    goalAlerts: boolean;
}

interface SecuritySettings {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipRestriction: boolean;
}

export interface Settings {
    company: CompanySettings;
    commissions: CommissionSettings;
    notifications: NotificationSettings;
    security: SecuritySettings;
}

const DEFAULT_SETTINGS: Settings = {
    company: {
        companyName: 'TechFinance',
        cnpj: '12.345.678/0001-90',
        email: 'contato@techfinance.com.br',
        phone: '(11) 3456-7890',
    },
    commissions: {
        seguradoraPercent: 50,
        techfinancePercent: 25,
        redePercent: 25,
    },
    notifications: {
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        goalAlerts: true,
    },
    security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        ipRestriction: false,
    },
};

const STORAGE_KEY = 'dashboard_settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save settings to localStorage
    const saveSettings = useCallback(async (newSettings: Partial<Settings>) => {
        setIsSaving(true);
        try {
            const updated = { ...settings, ...newSettings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setSettings(updated);
            toast.success('Configurações salvas com sucesso!');
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [settings]);

    // Update specific section
    const updateCompany = useCallback((data: Partial<CompanySettings>) => {
        return saveSettings({ company: { ...settings.company, ...data } });
    }, [settings, saveSettings]);

    const updateCommissions = useCallback((data: Partial<CommissionSettings>) => {
        return saveSettings({ commissions: { ...settings.commissions, ...data } });
    }, [settings, saveSettings]);

    const updateNotifications = useCallback((data: Partial<NotificationSettings>) => {
        return saveSettings({ notifications: { ...settings.notifications, ...data } });
    }, [settings, saveSettings]);

    const updateSecurity = useCallback((data: Partial<SecuritySettings>) => {
        return saveSettings({ security: { ...settings.security, ...data } });
    }, [settings, saveSettings]);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSettings(DEFAULT_SETTINGS);
        toast.info('Configurações restauradas para o padrão');
    }, []);

    return {
        settings,
        isLoading,
        isSaving,
        saveSettings,
        updateCompany,
        updateCommissions,
        updateNotifications,
        updateSecurity,
        resetSettings,
    };
};

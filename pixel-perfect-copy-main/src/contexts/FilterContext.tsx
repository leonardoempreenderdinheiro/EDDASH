import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { subDays, startOfMonth } from "date-fns";

export type CompanyType = "consolidado" | "seguros" | "capital" | "techfinance";

interface FilterContextType {
    selectedCompany: CompanyType;
    setSelectedCompany: (company: CompanyType) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    // 1. Company State
    const [selectedCompany, setSelectedCompany] = useState<CompanyType>(() => {
        const saved = localStorage.getItem("selectedCompany");
        if (saved && ["consolidado", "seguros", "capital", "techfinance"].includes(saved)) {
            return saved as CompanyType;
        }
        return "consolidado";
    });

    // 2. Date Range State (Default: Month to Date)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const savedStr = localStorage.getItem("dashboardDateRange");
        if (savedStr) {
            try {
                const saved = JSON.parse(savedStr);
                return {
                    from: saved.from ? new Date(saved.from) : undefined,
                    to: saved.to ? new Date(saved.to) : undefined
                };
            } catch (e) {
                console.error("Error parsing saved date range", e);
            }
        }
        return {
            from: startOfMonth(new Date()),
            to: new Date()
        };
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem("selectedCompany", selectedCompany);
    }, [selectedCompany]);

    useEffect(() => {
        if (dateRange) {
            localStorage.setItem("dashboardDateRange", JSON.stringify({
                from: dateRange.from?.toISOString(),
                to: dateRange.to?.toISOString()
            }));
        }
    }, [dateRange]);

    return (
        <FilterContext.Provider value={{
            selectedCompany,
            setSelectedCompany: setSelectedCompany as any,
            dateRange,
            setDateRange
        }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilters must be used within a FilterProvider");
    }
    return context;
};

// Compatibility for existing code using useCompany
export const useCompany = () => {
    const { selectedCompany, setSelectedCompany } = useFilters();
    return { selectedCompany, setSelectedCompany };
};

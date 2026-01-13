import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

const companies = [
    {
        value: "consolidado",
        label: "ED (Consolidado)",
        initials: "ED",
        color: "bg-primary"
    },
    {
        value: "seguros",
        label: "ED Seguros",
        initials: "ES",
        color: "bg-blue-500"
    },
    {
        value: "capital",
        label: "ED Capital",
        initials: "EC",
        color: "bg-emerald-500"
    },
    {
        value: "techfinance",
        label: "TechFinance",
        initials: "TF",
        color: "bg-purple-500"
    },
]

import { useFilters } from "@/contexts/FilterContext";

export function CompanySwitcher({ className }: { className?: string }) {
    const [open, setOpen] = React.useState(false)
    const { selectedCompany, setSelectedCompany } = useFilters()

    const selectedData = companies.find((c) => c.value === selectedCompany) || companies[0]

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-14 px-3 border-border/50 bg-secondary/30 hover:bg-secondary/50", className)}
                >
                    <div className="flex items-center gap-3 text-left">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg text-primary-foreground font-bold text-xs", selectedData.color)}>
                            {/* Logo Placeholder */}
                            {selectedData.initials}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold leading-none">{selectedData.label}</span>
                            <span className="text-xs text-muted-foreground">Trocar conta</span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar empresa..." className="h-9" />
                    <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                    <CommandGroup>
                        {companies.map((company) => (
                            <CommandItem
                                key={company.value}
                                value={company.value}
                                onSelect={(currentValue) => {
                                    setSelectedCompany(currentValue as any)
                                    setOpen(false)
                                }}
                                className="cursor-pointer"
                            >
                                <div className={cn("flex items-center justify-center w-6 h-6 mr-2 rounded-md text-primary-foreground font-bold text-[10px]", company.color)}>
                                    {company.initials}
                                </div>
                                {company.label}
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        selectedCompany === company.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

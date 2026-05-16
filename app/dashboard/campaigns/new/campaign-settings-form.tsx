"use client";

import type { TargetingOptions } from "@/app/dashboard/campaigns/new/types";
import type { CampaignDifficulty } from "@/lib/campaign-templates";
import type { TargetMode } from "@/lib/campaign-settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";

export interface CampaignSettingsFormValues {
  campaignName: string;
  targetMode: TargetMode;
  departments: string[];
  employeeIds: string[];
  difficultyOverride: boolean;
  overrideDifficulty: CampaignDifficulty | null;
  sendImmediately: boolean;
  scheduleAt: string;
  staggerSends: boolean;
  sharedEmail: boolean;
}

interface CampaignSettingsFormProps {
  values: CampaignSettingsFormValues;
  onChange: (patch: Partial<CampaignSettingsFormValues>) => void;
  targeting: TargetingOptions | null;
  targetingLoading: boolean;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled: boolean;
  loading: boolean;
}

function EmployeeMultiSelect({
  employees,
  selectedIds,
  onChange,
}: {
  employees: TargetingOptions["employees"];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const label =
    selectedIds.length === 0
      ? "Search employees…"
      : `${selectedIds.length} employee${selectedIds.length === 1 ? "" : "s"} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full"
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 rounded-[8px] font-normal"
          >
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or email…" />
          <CommandList>
            <CommandEmpty>No employees found.</CommandEmpty>
            <CommandGroup>
              {employees.map((emp) => (
                <CommandItem
                  key={emp.id}
                  value={`${emp.name} ${emp.email}`}
                  onSelect={() => toggle(emp.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selectedIds.includes(emp.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium">
                      {emp.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {emp.email}
                      {emp.department ? ` · ${emp.department}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CampaignSettingsForm({
  values,
  onChange,
  targeting,
  targetingLoading,
  onBack,
  onContinue,
  continueDisabled,
  loading,
}: CampaignSettingsFormProps) {
  const toggleDepartment = (dept: string, checked: boolean) => {
    if (checked) {
      onChange({ departments: [...values.departments, dept] });
    } else {
      onChange({
        departments: values.departments.filter((d) => d !== dept),
      });
    }
  };

  return (
    <div
      className="rounded-[12px] border p-8 flex flex-col gap-6"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="campaign-name">Campaign name</Label>
        <Input
          id="campaign-name"
          placeholder="Q2 Security Awareness Test"
          value={values.campaignName}
          onChange={(e) => onChange({ campaignName: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Target group</Label>
        <RadioGroup
          value={values.targetMode}
          onValueChange={(v) =>
            onChange({ targetMode: v as TargetMode })
          }
          className="gap-3"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="all" />
            <span className="text-[14px]" style={{ color: "var(--ds-ink)" }}>
              All employees
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="departments" />
            <span className="text-[14px]" style={{ color: "var(--ds-ink)" }}>
              By department
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="employees" />
            <span className="text-[14px]" style={{ color: "var(--ds-ink)" }}>
              Specific employees
            </span>
          </label>
        </RadioGroup>

        {values.targetMode === "departments" && (
          <div
            className="rounded-[8px] border p-3 max-h-40 overflow-y-auto flex flex-col gap-2"
            style={{ borderColor: "var(--ds-hairline)" }}
          >
            {targetingLoading ? (
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            ) : targeting?.departments.length ? (
              targeting.departments.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={values.departments.includes(dept)}
                    onCheckedChange={(checked) =>
                      toggleDepartment(dept, checked === true)
                    }
                  />
                  <span className="text-[14px]">{dept}</span>
                </label>
              ))
            ) : (
              <p className="text-[13px] text-muted-foreground">
                No departments found. Add employees with departments first.
              </p>
            )}
          </div>
        )}

        {values.targetMode === "employees" && (
          <div>
            {targetingLoading || !targeting ? (
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            ) : (
              <EmployeeMultiSelect
                employees={targeting.employees}
                selectedIds={values.employeeIds}
                onChange={(employeeIds) => onChange({ employeeIds })}
              />
            )}
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-4 rounded-[8px] border p-4"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <div>
          <p className="text-[14px] font-[500]" style={{ color: "var(--ds-ink)" }}>
            Difficulty override
          </p>
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            Use a custom difficulty instead of the template default
          </p>
        </div>
        <Switch
          checked={values.difficultyOverride}
          onCheckedChange={(checked) =>
            onChange({
              difficultyOverride: checked,
              overrideDifficulty: checked
                ? values.overrideDifficulty ?? "Medium"
                : null,
            })
          }
        />
      </div>

      {values.difficultyOverride && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="override-difficulty">Override difficulty</Label>
          <Select
            id="override-difficulty"
            value={values.overrideDifficulty ?? "Medium"}
            onChange={(e) =>
              onChange({
                overrideDifficulty: e.target.value as CampaignDifficulty,
              })
            }
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Label>Schedule</Label>
        <RadioGroup
          value={values.sendImmediately ? "immediate" : "scheduled"}
          onValueChange={(v) =>
            onChange({ sendImmediately: v === "immediate" })
          }
          className="gap-3"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="immediate" />
            <span className="text-[14px]">Send immediately</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="scheduled" />
            <span className="text-[14px]">Schedule for later</span>
          </label>
        </RadioGroup>
        {!values.sendImmediately && (
          <Input
            type="datetime-local"
            value={values.scheduleAt}
            onChange={(e) => onChange({ scheduleAt: e.target.value })}
          />
        )}
      </div>

      <div
        className="flex items-center justify-between gap-4 rounded-[8px] border p-4"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <div>
          <p className="text-[14px] font-[500]" style={{ color: "var(--ds-ink)" }}>
            Stagger sends
          </p>
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            Use randomized delivery delays from the selected template
          </p>
        </div>
        <Switch
          checked={values.staggerSends}
          onCheckedChange={(staggerSends) => onChange({ staggerSends })}
        />
      </div>

      <div
        className="flex items-center justify-between gap-4 rounded-[8px] border p-4"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <div>
          <p className="text-[14px] font-[500]" style={{ color: "var(--ds-ink)" }}>
            Shared email
          </p>
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            Send one generic email to all recipients — no per-employee personalisation.
            Useful for testing and reduces token usage.
          </p>
        </div>
        <Switch
          checked={values.sharedEmail}
          onCheckedChange={(sharedEmail) => onChange({ sharedEmail })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-4 rounded-[8px] text-[14px] font-[500] border transition-colors"
          style={{
            borderColor: "var(--ds-hairline-strong)",
            color: "var(--ds-ink)",
            backgroundColor: "transparent",
          }}
        >
          Back
        </button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || loading}
          className="flex-1 h-11 rounded-[8px] text-[14px] font-[500]"
          style={{
            backgroundColor:
              continueDisabled || loading
                ? "var(--ds-hairline)"
                : "var(--ds-primary)",
            color:
              continueDisabled || loading ? "var(--ds-muted)" : "#ffffff",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

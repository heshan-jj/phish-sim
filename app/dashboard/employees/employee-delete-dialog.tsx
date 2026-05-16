"use client";

import { deleteEmployee } from "@/app/dashboard/employees/_actions";
import type { EmployeeListItem } from "@/app/dashboard/employees/employees-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface EmployeeDeleteDialogProps {
  employee: EmployeeListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (employeeId: string) => void;
}

export function EmployeeDeleteDialog({
  employee,
  open,
  onOpenChange,
  onDeleted,
}: EmployeeDeleteDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!employee) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteEmployee(employee.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("Employee deleted");
      onDeleted?.(employee.id);
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Something went wrong while deleting.");
    } finally {
      setDeleting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete employee</DialogTitle>
          <DialogDescription>
            {employee ? (
              <>
                Remove <strong>{employee.name}</strong> ({employee.email}) from
                your directory? This also deletes their campaign participation
                and event history.
              </>
            ) : (
              "Remove this employee from your directory?"
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
            {error}
          </p>
        )}

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="dsOutline"
            size="app"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="app"
            disabled={deleting || !employee}
            onClick={() => void handleDelete()}
          >
            {deleting ? "Deleting…" : "Delete employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

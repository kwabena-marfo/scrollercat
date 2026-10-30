"use client";

import { useEffect, useState } from "react";
import { BsTrash } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import useTriggerRequest from "@/hooks/useTriggerRequest";

import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoriesModal({
  isOpen,
  categories,
  onClose,
  mutateProducts,
}: {
  isOpen: boolean;
  categories: { id: string; name: string }[];
  onClose: () => void;
  mutateProducts: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const { reqFunction, reqState, setReqState } = useTriggerRequest();

  useEffect(() => {
    if (reqState?.data) {
      mutateProducts();
      toast({ title: reqState.data as string });
      setReqState(undefined);
      setName("");
    }
  }, [reqState?.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) reqFunction({ route: "/api/admin/categories/create", reqType: "post", data: { name } });
  };

  const remove = (c: { id: string; name: string }) => {
    if (window.confirm(`Delete the "${c.name}" category? Its products stay, uncategorised.`)) {
      reqFunction({ route: `/api/admin/categories/delete?id=${c.id}`, reqType: "post" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
        </DialogHeader>

        <form onSubmit={add} className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" error={false} />
          <Button type="submit" disabled={reqState?.pending || !name.trim()}>
            {reqState?.pending ? <LuLoader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </form>
        {reqState?.error && <p className="text-xs text-red-500">{reqState.error as string}</p>}

        <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
              {c.name}
              <button
                type="button"
                onClick={() => remove(c)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${c.name}`}
              >
                <BsTrash />
              </button>
            </li>
          ))}
          {!categories.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No categories yet</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

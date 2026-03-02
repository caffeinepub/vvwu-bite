import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { MenuItem } from "../../backend.d.ts";
import {
  useAddMenuItem,
  useMenuByDay,
  useRemoveMenuItem,
  useUpdateMenuItem,
} from "../../hooks/useQueries";
import {
  DAYS,
  DAY_MENU,
  ITEM_PRICES,
  getCurrentDay,
  getItemImage,
} from "../../utils/constants";

const CATEGORIES = [
  "Main Course",
  "Snack",
  "Beverage",
  "Dessert",
  "Rice",
  "Bread",
];

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  imageUrl: string;
  dayOfWeek: string;
}

function DayMenuList({ day }: { day: string }) {
  const { data: items, isLoading } = useMenuByDay(day);
  const addItem = useAddMenuItem();
  const updateItem = useUpdateMenuItem();
  const removeItem = useRemoveMenuItem();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormData>({
    name: "",
    description: "",
    price: "0",
    quantity: "50",
    category: "Snack",
    imageUrl: "",
    dayOfWeek: day,
  });

  const openAddModal = () => {
    setEditingItem(null);
    const defaultName = DAY_MENU[day]?.[0] ?? "";
    setForm({
      name: defaultName,
      description: "",
      price: String(ITEM_PRICES[defaultName] ?? 30),
      quantity: "50",
      category: "Snack",
      imageUrl: "",
      dayOfWeek: day,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      quantity: String(Number(item.quantity)),
      category: item.category,
      imageUrl: item.imageUrl,
      dayOfWeek: item.dayOfWeek,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const itemData: MenuItem = {
      id: editingItem?.id ?? `${day}-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      quantity: BigInt(Number(form.quantity) || 0),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
      dayOfWeek: day,
    };

    if (editingItem) {
      await updateItem.mutateAsync({ id: editingItem.id, item: itemData });
    } else {
      await addItem.mutateAsync(itemData);
    }
    setModalOpen(false);
  };

  const isSaving = addItem.isPending || updateItem.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold">{day}&apos;s Menu</h3>
          <p className="text-xs text-muted-foreground">
            {items?.length ?? 0} item{items?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 font-heading gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Item
        </Button>
      </div>

      {/* Items Table */}
      {isLoading ? (
        <div className="space-y-3">
          {["msk1", "msk2", "msk3", "msk4"].map((id) => (
            <Skeleton key={id} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {item.imageUrl || getItemImage(item) ? (
                    <img
                      src={getItemImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-semibold text-sm truncate">
                      {item.name}
                    </p>
                    <Badge className="text-xs bg-muted text-muted-foreground border-border border hidden sm:block">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-heading font-bold text-accent">
                      ₹{item.price}
                    </span>
                    <span
                      className={`${Number(item.quantity) === 0 ? "text-destructive" : Number(item.quantity) <= 10 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      Qty: {Number(item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-muted-foreground text-sm font-heading mb-3">
            No items for {day} yet
          </p>
          <Button
            size="sm"
            onClick={openAddModal}
            variant="outline"
            className="border-border font-heading text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add First Item
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold gradient-text">
              {editingItem ? "Edit Menu Item" : `Add Item — ${day}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="font-heading text-xs">Item Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      price: String(ITEM_PRICES[name] ?? prev.price),
                    }));
                  }}
                  placeholder="e.g. Pav Bhaji"
                  className="bg-muted border-border font-heading text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-heading text-xs">Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="e.g. 60"
                  className="bg-muted border-border font-heading text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-heading text-xs">Quantity *</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  placeholder="e.g. 50"
                  className="bg-muted border-border font-heading text-sm"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="font-heading text-xs">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, category: cat }))
                      }
                      className={`px-3 py-1 rounded-full text-xs font-heading border transition-all ${
                        form.category === cat
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="font-heading text-xs">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the dish..."
                  className="bg-muted border-border text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="font-heading text-xs">
                  Image URL (optional)
                </Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  placeholder="/assets/generated/... (leave blank for auto)"
                  className="bg-muted border-border font-heading text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-border font-heading text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={isSaving || !form.name.trim()}
              className="bg-primary hover:bg-primary/90 font-heading text-xs gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold">
              Delete Menu Item?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This action cannot be undone. The item will be permanently removed
              from the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border font-heading text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  void removeItem.mutateAsync(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90 font-heading text-xs"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AdminMenuManager() {
  const today = getCurrentDay();
  const [selectedDay, setSelectedDay] = useState<string>(today);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-xs font-heading uppercase tracking-widest text-accent mb-1">
            Admin
          </p>
          <h1 className="font-display font-bold text-3xl gradient-text">
            Menu Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage day-wise menu items. Add, edit, or remove food items.
          </p>
        </motion.div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <div className="overflow-x-auto pb-2 mb-6">
            <TabsList className="bg-card border border-border h-auto p-1 gap-1 inline-flex min-w-full sm:min-w-0">
              {DAYS.map((day) => {
                const isToday = day === today;
                return (
                  <TabsTrigger
                    key={day}
                    value={day}
                    className={`flex-shrink-0 px-3 py-2 rounded-md font-heading text-sm font-medium relative ${
                      isToday
                        ? "data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                        : "data-[state=active]:bg-muted"
                    }`}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                    {isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {DAYS.map((day) => (
            <TabsContent key={day} value={day} className="mt-0">
              <DayMenuList day={day} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

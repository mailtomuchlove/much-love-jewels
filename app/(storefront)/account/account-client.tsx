"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProfile } from "@/app/actions/auth";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/actions/addresses";
import { toggleWishlist } from "@/app/actions/wishlist";
import { formatPrice } from "@/lib/utils";
import { INDIAN_STATES } from "@/utils/constants";
import { toast } from "sonner";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Star,
  ChevronRight,
} from "lucide-react";
import type { Profile, Address } from "@/types";

type Tab = "profile" | "orders" | "addresses" | "wishlist";

type OrderItem = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_paise: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price_paise: number;
    products: { images: string[]; image_public_ids: string[] } | null;
  }>;
};

type WishlistItem = {
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number | null;
    images: string[];
    image_public_ids: string[];
    stock: number;
  } | null;
};

interface AccountClientProps {
  profile: Profile;
  email: string;
  initialTab?: Tab;
  orders: OrderItem[];
  addresses: Address[];
  wishlistItems: WishlistItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
};

const EMPTY_ADDR = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export function AccountClient({
  profile,
  email,
  initialTab = "profile",
  orders,
  addresses: initialAddresses,
  wishlistItems: initialWishlist,
}: AccountClientProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [wishlist, setWishlist] = useState(initialWishlist);

  // Profile form
  const [profileName, setProfileName] = useState(profile.name ?? "");
  const [profilePhone, setProfilePhone] = useState(profile.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address dialog
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);

  const router = useRouter();

  async function handleSaveProfile() {
    if (!profileName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (profilePhone && !/^[6-9]\d{9}$/.test(profilePhone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setSavingProfile(true);
    const result = await updateProfile({ name: profileName, phone: profilePhone });
    setSavingProfile(false);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated!");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function openNewAddress() {
    setEditingAddress(null);
    setAddrForm(EMPTY_ADDR);
    setAddrDialogOpen(true);
  }

  function openEditAddress(addr: Address) {
    setEditingAddress(addr);
    setAddrForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default,
    });
    setAddrDialogOpen(true);
  }

  async function handleSaveAddress() {
    if (!addrForm.name.trim()) { toast.error("Full name is required"); return; }
    if (!addrForm.phone.trim()) { toast.error("Phone number is required"); return; }
    if (!/^[6-9]\d{9}$/.test(addrForm.phone)) { toast.error("Enter a valid 10-digit Indian mobile number"); return; }
    if (!addrForm.line1.trim()) { toast.error("Address line 1 is required"); return; }
    if (!addrForm.city.trim()) { toast.error("City is required"); return; }
    if (!addrForm.state) { toast.error("State is required"); return; }
    if (!/^\d{6}$/.test(addrForm.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    setSavingAddr(true);
    const result = editingAddress
      ? await updateAddress(editingAddress.id, addrForm)
      : await createAddress(addrForm);
    setSavingAddr(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(editingAddress ? "Address updated!" : "Address saved!");
    setAddrDialogOpen(false);

    // Refresh addresses list
    router.refresh();
  }

  async function handleDeleteAddress(id: string) {
    const result = await deleteAddress(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Address removed");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Default address updated");
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    }
  }

  async function handleRemoveWishlist(productId: string) {
    const result = await toggleWishlist(productId);
    if (result.success && !result.data.added) {
      toast.success("Removed from wishlist");
      setWishlist((prev) => prev.filter((w) => w.product_id !== productId));
    } else if (!result.success) {
      toast.error("Failed to remove from wishlist");
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "orders", label: `Orders (${orders.length})`, icon: <Package className="h-4 w-4" /> },
    { id: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
    { id: "wishlist", label: `Wishlist (${wishlist.length})`, icon: <Heart className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0">
        <nav className="rounded-lg border border-brand-border bg-white overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-brand-border last:border-0 ${
                tab === t.id
                  ? "bg-brand-navy text-white"
                  : "text-brand-text hover:bg-brand-cream"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div className="rounded-lg border border-brand-border bg-white p-5 md:p-6">
            <h2 className="font-poppins text-base font-semibold text-brand-navy mb-5">
              Profile Information
            </h2>
            <div className="space-y-4 max-w-sm">
              <div>
                <Label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  maxLength={10}
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-400">Email (cannot change)</Label>
                <Input
                  value={email}
                  disabled
                  className="mt-1 h-10 bg-gray-50 text-gray-400 text-xs"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-brand-navy hover:bg-brand-navy-light text-white h-10"
              >
                {savingProfile ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div className="rounded-lg border border-brand-border bg-white overflow-hidden">
            <div className="p-5 md:p-6 border-b border-brand-border">
              <h2 className="font-poppins text-base font-semibold text-brand-navy">
                Order History
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No orders yet.</p>
                <Link href="/collections/all" className={buttonVariants({ variant: "outline" }) + " mt-4 h-10"}>Start Shopping</Link>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {orders.map((order) => {
                  const firstItem = order.order_items[0];
                  const imageUrl = firstItem?.products?.images?.[0];
                  return (
                    <li key={order.id} className="p-4 md:p-5 hover:bg-brand-cream/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-brand-cream">
                          <SafeImage
                            src={imageUrl}
                            alt={firstItem.product_name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-brand-navy">
                              {order.order_number}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                                STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}{" "}
                            · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-brand-navy">
                            {formatPrice(order.total_paise)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {tab === "addresses" && (
          <div className="rounded-lg border border-brand-border bg-white overflow-hidden">
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-brand-border">
              <h2 className="font-poppins text-base font-semibold text-brand-navy">
                Saved Addresses
              </h2>
              <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                <DialogTrigger
                  onClick={openNewAddress}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-medium transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? "Edit Address" : "New Address"}
                    </DialogTitle>
                  </DialogHeader>
                  <AddressForm
                    form={addrForm}
                    setForm={setAddrForm}
                    onSave={handleSaveAddress}
                    saving={savingAddr}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {addresses.length === 0 ? (
              <div className="p-10 text-center">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No saved addresses.</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {addresses.map((addr) => (
                  <li key={addr.id} className="p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-brand-text">
                            {addr.name}
                          </p>
                          {addr.is_default && (
                            <span className="inline-flex items-center rounded-full bg-brand-gold/10 px-2 py-0.5 text-xs font-medium text-brand-gold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""},{" "}
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!addr.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditAddress(addr)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete address?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this address.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Wishlist Tab ── */}
        {tab === "wishlist" && (
          <div className="rounded-lg border border-brand-border bg-white overflow-hidden">
            <div className="p-5 md:p-6 border-b border-brand-border">
              <h2 className="font-poppins text-base font-semibold text-brand-navy">
                Wishlist
              </h2>
            </div>
            {wishlist.length === 0 ? (
              <div className="p-10 text-center">
                <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Your wishlist is empty.</p>
                <Link href="/collections/all" className={buttonVariants({ variant: "outline" }) + " mt-4 h-10"}>Explore Jewels</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-brand-border sm:grid-cols-3">
                {wishlist.map(({ product_id, product }) => {
                  if (!product) return null;
                  const discount = product.compare_price
                    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                    : 0;
                  return (
                    <div key={product_id} className="bg-white p-4 relative group">
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveWishlist(product_id)}
                        className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                      </button>

                      <Link href={`/products/${product.slug}`} className="block">
                        <div className="aspect-square overflow-hidden rounded-md bg-brand-cream mb-3">
                          {product.images[0] ? (
                            <SafeImage
                              src={product.images[0]}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Star className="h-8 w-8 text-brand-gold/30" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-brand-text line-clamp-2 mb-1.5">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-navy">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(product.compare_price)}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="text-xs font-medium text-green-600">
                              {discount}% off
                            </span>
                          )}
                        </div>
                        {product.stock === 0 && (
                          <p className="text-xs text-red-500 mt-1">Out of stock</p>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Address Form ──
interface AddressFormProps {
  form: typeof EMPTY_ADDR;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_ADDR>>;
  onSave: () => void;
  saving: boolean;
}

function AddressForm({ form, setForm, onSave, saving }: AddressFormProps) {
  const set = (key: keyof typeof EMPTY_ADDR) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></Label>
          <Input value={form.name} onChange={set("name")} placeholder="Your name" required className="mt-1 h-10" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-xs font-medium">Phone <span className="text-red-500">*</span></Label>
          <Input value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" maxLength={10} required className="mt-1 h-10" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs font-medium">Address Line 1 <span className="text-red-500">*</span></Label>
          <Input value={form.line1} onChange={set("line1")} placeholder="House / Flat / Street" required className="mt-1 h-10" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs font-medium">
            Address Line 2 <span className="text-gray-400">(optional)</span>
          </Label>
          <Input value={form.line2} onChange={set("line2")} placeholder="Landmark / Area" className="mt-1 h-10" />
        </div>
        <div>
          <Label className="text-xs font-medium">City <span className="text-red-500">*</span></Label>
          <Input value={form.city} onChange={set("city")} placeholder="City" required className="mt-1 h-10" />
        </div>
        <div>
          <Label className="text-xs font-medium">Pincode <span className="text-red-500">*</span></Label>
          <Input
            value={form.pincode}
            onChange={set("pincode")}
            placeholder="6-digit pincode"
            maxLength={6}
            required
            className="mt-1 h-10"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs font-medium">State <span className="text-red-500">*</span></Label>
          <Select value={form.state} onValueChange={(v) => setForm((p) => ({ ...p, state: v ?? "" }))}>
            <SelectTrigger className="mt-1 h-10">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_default"
          checked={form.is_default}
          onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
          className="accent-brand-navy"
        />
        <Label htmlFor="is_default" className="text-xs font-medium cursor-pointer">
          Set as default address
        </Label>
      </div>
      <Separator />
      <Button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-brand-navy hover:bg-brand-navy-light text-white h-10"
      >
        {saving ? "Saving…" : "Save Address"}
      </Button>
    </div>
  );
}

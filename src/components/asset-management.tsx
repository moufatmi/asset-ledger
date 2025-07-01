"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import type { Asset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AssetForm, assetSchema } from "./asset-form";
import AssetTable from "./asset-table";
import { PlusCircle, Search } from "lucide-react";

const initialAssets: Asset[] = [
  { id: "1", name: "Dell XPS 15", description: "Company-issued laptop for development.", purchaseDate: new Date("2023-01-15"), value: 2100 },
  { id: "2", name: "Herman Miller Aeron", description: "Ergonomic office chair.", purchaseDate: new Date("2022-11-20"), value: 1200 },
  { id: "3", name: "Sony WH-1000XM5 Headphones", description: "Noise-cancelling headphones for focus.", purchaseDate: new Date("2023-05-30"), value: 399 },
  { id: "4", name: "iPhone 14 Pro", description: "Personal and work mobile device.", purchaseDate: new Date("2022-09-16"), value: 999 },
];

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEditOpen, setAddEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const filteredAssets = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowercasedFilter) ||
        asset.description.toLowerCase().includes(lowercasedFilter) ||
        format(asset.purchaseDate, "PPP").toLowerCase().includes(lowercasedFilter)
    );
  }, [assets, searchTerm]);

  const handleOpenAdd = () => {
    setSelectedAsset(null);
    setAddEditOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setAddEditOpen(true);
  };

  const handleOpenDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (values: z.infer<typeof assetSchema>) => {
    if (selectedAsset) {
      // Editing existing asset
      setAssets(
        assets.map((asset) =>
          asset.id === selectedAsset.id ? { ...asset, ...values } : asset
        )
      );
      toast({ title: "Asset Updated", description: `"${values.name}" has been updated successfully.` });
    } else {
      // Adding new asset
      setAssets([...assets, { id: crypto.randomUUID(), ...values }]);
      toast({ title: "Asset Added", description: `"${values.name}" has been added to the ledger.` });
    }
    setAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedAsset) {
      setAssets(assets.filter((asset) => asset.id !== selectedAsset.id));
      toast({ title: "Asset Deleted", description: `"${selectedAsset.name}" has been removed.`, variant: 'destructive' });
      setDeleteOpen(false);
      setSelectedAsset(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Asset Ledger</h1>
          <p className="text-muted-foreground">
            A central registry for all your valuable items.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </header>
      <main>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, date..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <AssetTable assets={filteredAssets} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
      </main>

      <Dialog open={isAddEditOpen} onOpenChange={setAddEditOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
            <DialogDescription>
              {selectedAsset ? "Update the details of your existing asset." : "Fill in the form to register a new asset."}
            </DialogDescription>
          </DialogHeader>
          <AssetForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedAsset ?? undefined}
            submitButtonText={selectedAsset ? "Save Changes" : "Add Asset"}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              <span className="font-semibold"> "{selectedAsset?.name}"</span> from the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function format(date: Date, formatString: string) {
    return new window.Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
}

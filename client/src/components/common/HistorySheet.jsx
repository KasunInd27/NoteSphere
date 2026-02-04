import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, RotateCcw, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner"; // Assuming sonner or use standard alert

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HistorySheet = ({ pageId }) => {
    const [snapshots, setSnapshots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchSnapshots = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/pages/${pageId}/snapshots`, { withCredentials: true });
            setSnapshots(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const createSnapshot = async () => {
        setIsCreating(true);
        try {
            const res = await axios.post(`${API_URL}/api/pages/${pageId}/snapshots`, {}, { withCredentials: true });
            setSnapshots([res.data, ...snapshots]);
            toast.success("Snapshot created");
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const restoreSnapshot = async (id) => {
        if (!confirm("Are you sure? Current content will be overwritten.")) return;
        try {
            await axios.post(`${API_URL}/api/snapshots/${id}/restore`, {}, { withCredentials: true });
            window.location.reload(); // Simple reload to fetch new content
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Sheet onOpenChange={(open) => {
            if (open) fetchSnapshots();
        }}>
            <SheetTrigger asChild>
                <div role="button" className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors" title="Version History">
                    <History className="w-5 h-5 text-muted-foreground" />
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Version History</SheetTitle>
                    <SheetDescription>
                        View and restore previous versions of this page.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    <Button onClick={createSnapshot} disabled={isCreating} className="w-full mb-4" variant="outline">
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Create Snapshot
                    </Button>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-sm text-center text-muted-foreground">Loading history...</div>
                        ) : snapshots.length === 0 ? (
                            <div className="text-sm text-center text-muted-foreground">No snapshots found.</div>
                        ) : (
                            snapshots.map((snap) => (
                                <div key={snap._id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {format(new Date(snap.createdAt), 'MMM d, yyyy')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(snap.createdAt), 'h:mm a')}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => restoreSnapshot(snap._id)} title="Restore">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default HistorySheet;

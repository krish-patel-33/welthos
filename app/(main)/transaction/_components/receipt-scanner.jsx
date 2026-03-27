"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanReceipt } from "@/action/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleReceiptScan = async (file) => {
    console.log("Starting receipt scan, file:", file.name, file.type, file.size);

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setLoading(true);

      // Convert file to base64 on client side
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log("File read successfully, converting to base64...");
          const base64String = e.target.result.split(',')[1]; // Remove data:image/xxx;base64, prefix
          console.log("Base64 length:", base64String.length);

          console.log("Calling scanReceipt server action...");
          const scannedData = await scanReceipt({
            base64: base64String,
            mimeType: file.type,
          });

          console.log("Received scanned data:", scannedData);

          if (scannedData) {
            onScanComplete(scannedData);
            toast.success("Receipt scanned successfully");
          } else {
            toast.error("Could not extract data from receipt");
          }
        } catch (error) {
          console.error("Error scanning receipt:", error);
          toast.error(error.message || "Failed to scan receipt");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        toast.error("Failed to read file");
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}

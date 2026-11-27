"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScanBarcode } from "lucide-react";

export default function BarcodeScannerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigatingRef = useRef(false);

  async function lookup(code: string) {
    if (navigatingRef.current) return;
    const trimmed = code.trim();
    if (!trimmed) return;
    setStatus("Looking up...");
    try {
      const res = await fetch(
        `/api/product/by-barcode?barcode=${encodeURIComponent(trimmed)}`,
      );
      const json = await res.json();
      if (!res.ok || !json?.data?.product) {
        setStatus("Product not found");
        return;
      }
      navigatingRef.current = true;
      setOpen(false);
      router.push(`/products/${json.data.product.id}`);
    } catch {
      setStatus("Lookup failed");
    }
  }

  useEffect(() => {
    if (!open) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setScanning(false);
      setStatus(null);
      navigatingRef.current = false;
      return;
    }

    let cancelled = false;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Camera not supported");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);

        const Detector = (window as any).BarcodeDetector;
        if (!Detector) {
          setStatus("Manual entry only (no BarcodeDetector)");
          return;
        }
        const detector = new Detector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] });
        const loop = async () => {
          if (cancelled || navigatingRef.current) return;
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes && codes.length > 0) {
                await lookup(codes[0].rawValue);
                return;
              }
            } catch {
              // ignore
            }
          }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      } catch (e) {
        setStatus("Camera permission denied or unavailable");
      }
    }
    startCamera();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ScanBarcode className="mr-1 size-4" /> Scan Barcode
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Scan Barcode</h2>
              <button onClick={() => setOpen(false)} className="text-sm">
                Close
              </button>
            </div>
            <video
              ref={videoRef}
              className="h-48 w-full bg-black object-cover"
              muted
              playsInline
            />
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-sm"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Manual barcode entry"
              />
              <Button size="sm" onClick={() => lookup(manual)}>
                Find
              </Button>
            </div>
            {status && <p className="mt-2 text-sm text-muted-foreground">{status}</p>}
          </div>
        </div>
      )}
    </>
  );
}

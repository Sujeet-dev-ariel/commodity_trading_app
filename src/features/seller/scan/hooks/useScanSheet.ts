import { INITIAL_PARSED_ROWS, type ParsedSheetRow } from "@/mocks/scan";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export type ScanStep = "scan" | "review";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 0.8,
};

/**
 * Seller price-sheet scan flow (`isScan` + `isReview` in Seller App.html).
 * Photo capture/pick is real (expo-image-picker); row parsing is simulated —
 * there is no OCR backend yet, so parsing yields the static sample rows for
 * the seller to review, correct, and publish.
 */
export function useScanSheet() {
  const [step, setStep] = useState<ScanStep>("scan");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rows, setRows] = useState<ParsedSheetRow[]>(INITIAL_PARSED_ROWS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (parseTimer.current) clearTimeout(parseTimer.current);
    };
  }, []);

  const takePhoto = useCallback(async () => {
    if (isPicking || isParsing) return;
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera access needed",
          "Allow camera access to photograph today's price sheet.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri ?? null);
      }
    } finally {
      setIsPicking(false);
    }
  }, [isParsing, isPicking]);

  const pickFromLibrary = useCallback(async () => {
    if (isPicking || isParsing) return;
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          "Allow photo library access to upload the price sheet.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri ?? null);
      }
    } finally {
      setIsPicking(false);
    }
  }, [isParsing, isPicking]);

  const clearPhoto = useCallback(() => {
    setPhotoUri(null);
  }, []);

  /** Simulated parse — swap with an OCR API call when the backend exists. */
  const parseSheet = useCallback(() => {
    if (isParsing || !photoUri) return;
    setIsParsing(true);
    parseTimer.current = setTimeout(() => {
      parseTimer.current = null;
      setIsParsing(false);
      setRows(INITIAL_PARSED_ROWS);
      setEditingId(null);
      setStep("review");
    }, 900);
  }, [isParsing, photoUri]);

  const setRowPrice = useCallback((id: number, price: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, price } : r)));
  }, []);

  const backToScan = useCallback(() => {
    if (parseTimer.current) {
      clearTimeout(parseTimer.current);
      parseTimer.current = null;
    }
    setIsParsing(false);
    setEditingId(null);
    setStep("scan");
  }, []);

  return {
    step,
    photoUri,
    isPicking,
    isParsing,
    rows,
    editingId,
    setEditingId,
    setRowPrice,
    takePhoto,
    pickFromLibrary,
    clearPhoto,
    parseSheet,
    backToScan,
  };
}

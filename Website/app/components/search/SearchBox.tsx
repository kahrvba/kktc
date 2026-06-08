"use client";

import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { IoMdAttach } from "react-icons/io";
import { IoClose, IoSend } from "react-icons/io5";
import { MdCameraAlt, MdAttachFile } from "react-icons/md";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { fileToBase64 } from "@/app/lib/fileToBase64";

export default function SearchBox() {
  const [attachOpen, setAttachOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const inputTextRef = useRef("");
  const [micSupported, setMicSupported] = useState(true);

  // image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // camera permission state
  const [cameraError, setCameraError] = useState<string | null>(null);

  // response
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      inputTextRef.current = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    setMicSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (!attachOpen) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-attach-area]")) setAttachOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [attachOpen]);

  // ── mic ────────────────────────────────────────────────────────────────────
  function handleMicClick() {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  }

  // ── camera — uses getUserMedia to request permission, then captures ────────
  async function handleTakeImage() {
    setAttachOpen(false);
    setCameraError(null);

    // On mobile browsers, getUserMedia opens the camera with permission prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Stop the stream immediately — we just needed the permission grant
      // then trigger the file input with capture so the OS camera opens
      stream.getTracks().forEach((t) => t.stop());

      // After permission is granted, trigger the native camera picker
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleImageSelected(file);
      };
      input.click();
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (e.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        // Fallback — just open the native camera picker directly
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";
        input.onchange = (ev) => {
          const file = (ev.target as HTMLInputElement).files?.[0];
          if (file) handleImageSelected(file);
        };
        input.click();
      }
    }
  }

  // ── image ──────────────────────────────────────────────────────────────────
  function handleImageSelected(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAttachOpen(false);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageSelected(file);
    e.target.value = "";
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  // ── send ───────────────────────────────────────────────────────────────────
  async function handleSend() {
    const text = (inputTextRef.current || inputText).trim();
    if (!text && !imageFile) return;

    if (listening) SpeechRecognition.stopListening();

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let imageBase64: string | null = null;
      let imageMimeType: string | null = null;

      if (imageFile) {
        const result = await fileToBase64(imageFile);
        imageBase64 = result.base64;
        imageMimeType = result.mimeType;
      }

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, imageBase64, imageMimeType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "Something went wrong.");
      } else {
        setResponse(data.result);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Hidden file input for gallery/storage */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        aria-label="Upload image from device"
      />

      <p className="text-sm font-semibold text-slate-950">Find a service provider</p>
      <p className="mt-1 text-xs text-slate-500">
        Describe what you need, snap or attach an image, and tap Send.
      </p>

      {/* Camera permission error */}
      {cameraError && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
          <IoClose className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mt-3 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Attached preview"
            className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
            aria-label="Remove image"
          >
            <IoClose className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1 min-w-0" data-attach-area>
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              inputTextRef.current = e.target.value;
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={listening ? "Listening…" : "What do you need?"}
            className={`w-full rounded-full border bg-slate-50 px-4 py-3 pr-[4.5rem] text-sm text-slate-900 outline-none transition ${
              listening
                ? "border-sky-500 ring-2 ring-sky-100 bg-white"
                : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white"
            }`}
          />

          {/* Attach + Mic */}
          <div className="absolute inset-y-0 right-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAttachOpen((v) => !v)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                imageFile ? "bg-sky-100 text-sky-600" : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label="Attach image"
            >
              <IoMdAttach className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleMicClick}
              disabled={!micSupported}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-slate-600"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={listening ? "Stop recording" : "Start voice input"}
            >
              {listening ? <FaStop className="h-3 w-3" /> : <FaMicrophone className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Attach dropdown */}
          {attachOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <button
                type="button"
                onClick={handleTakeImage}
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
                  <MdCameraAlt className="h-5 w-5 text-sky-600" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Take a photo</p>
                  <p className="text-xs text-slate-500">Opens your camera</p>
                </div>
              </button>
              <div className="h-px bg-slate-100 mx-4" />
              <button
                type="button"
                onClick={() => { uploadInputRef.current?.click(); setAttachOpen(false); }}
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                  <MdAttachFile className="h-5 w-5 text-amber-600" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Upload from storage</p>
                  <p className="text-xs text-slate-500">Pick from your gallery</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || (!inputText.trim() && !imageFile)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <IoSend className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Response */}
      {(response || error) && (
        <div className={`mt-4 rounded-2xl border p-4 text-sm leading-7 whitespace-pre-wrap ${
          error ? "border-red-200 bg-red-50 text-red-700" : "border-sky-100 bg-sky-50 text-slate-800"
        }`}>
          {error ?? response}
        </div>
      )}
    </div>
  );
}

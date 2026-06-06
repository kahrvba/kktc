"use client";

import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { IoMdAttach } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdCameraAlt, MdAttachFile } from "react-icons/md";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { fileToBase64 } from "@/app/lib/fileToBase64";

export default function SearchBox() {
  const [attachOpen, setAttachOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const inputTextRef = useRef("");
  const [micSupported, setMicSupported] = useState(true);

  // image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // response
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hidden file input refs
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // live transcript → input
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      inputTextRef.current = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    setMicSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  // close dropdown on outside click
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

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      {/* Hidden file inputs */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        aria-label="Upload image from device"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
        aria-label="Take photo with camera"
      />

      <p className="text-sm font-semibold text-slate-950">
        Search for a service provider
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Attach an image or take a picture, add a voice note, and then tap Send.
      </p>

      {/* Image preview */}
      {imagePreview && (
        <div className="mt-4 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Attached preview"
            className="h-24 w-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
            aria-label="Remove image"
          >
            <IoClose className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex-1 min-w-0" data-attach-area>
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              inputTextRef.current = e.target.value;
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              listening ? "Listening…" : "Type your request or tap the mic…"
            }
            className={`w-full rounded-full border bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition sm:pr-24 lg:pr-28 ${
              listening
                ? "border-sky-500 ring-2 ring-sky-100"
                : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            }`}
          />

          {/* Attach + Mic buttons */}
          <div className="absolute inset-y-0 right-4 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAttachOpen((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                imageFile
                  ? "bg-sky-100 text-sky-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              aria-label="Attach image"
            >
              <IoMdAttach className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleMicClick}
              disabled={!micSupported}
              title={
                !micSupported
                  ? "Speech recognition not supported in this browser"
                  : listening
                  ? "Stop recording"
                  : "Start voice input"
              }
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={listening ? "Stop recording" : "Start voice input"}
            >
              {listening ? (
                <FaStop className="h-3 w-3" />
              ) : (
                <FaMicrophone className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Attach dropdown */}
          {attachOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-t-3xl px-5 py-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <MdCameraAlt className="h-5 w-5 text-sky-500 shrink-0" />
                <span>Take image</span>
              </button>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-b-3xl border-t border-slate-200 px-5 py-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <MdAttachFile className="h-5 w-5 text-amber-500 shrink-0" />
                <span>Attach image</span>
              </button>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || (!inputText.trim() && !imageFile)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Searching…
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>

      {/* Response area */}
      {(response || error) && (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm leading-7 ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          {error ?? response}
        </div>
      )}
    </div>
  );
}

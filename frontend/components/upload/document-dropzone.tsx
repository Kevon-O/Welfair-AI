"use client";

import { useRef, useState } from "react";
import { analyzeDocument } from "@/lib/api";
import type { AnalyzeDocumentResponse } from "@/lib/types";
import { classNames } from "@/lib/utils";

type DocumentDropzoneProps = {
  title: string;
  description: string;
  onAnalyzed: (result: AnalyzeDocumentResponse) => void;
};

export function DocumentDropzone({
  title,
  description,
  onAnalyzed,
}: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  async function runAnalysis(file: File): Promise<void> {
    try {
      setUploadState("loading");
      setErrorMessage(null);
      setSelectedFileName(file.name);

      const result = await analyzeDocument(file);
      onAnalyzed(result);
      setUploadState("idle");
    } catch (error) {
      setUploadState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not analyze this upload right now.",
      );
    }
  }

  async function handleFiles(files: FileList | null): Promise<void> {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

    await runAnalysis(nextFile);
  }

  return (
    <section className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.26)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            Upload a document
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <div className="text-sm text-slate-500">PDF, image, or text file</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,image/*"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <button
        type="button"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        disabled={uploadState === "loading"}
        className={classNames(
          "mt-5 flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 py-12 text-center transition",
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-violet-200 bg-[linear-gradient(180deg,_#fcfaff_0%,_#ffffff_100%)] hover:border-violet-300 hover:bg-violet-50/60",
          uploadState === "loading" ? "cursor-wait" : "cursor-pointer",
        )}
      >
        <div className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700">
          {uploadState === "loading" ? "Analyzing..." : "Choose file"}
        </div>
        <div className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
          Drag a document here or click to browse. We will analyze the file and
          prepare it for a new case or an existing one.
        </div>
        {selectedFileName ? (
          <div className="mt-3 text-sm font-medium text-slate-800">
            {selectedFileName}
          </div>
        ) : null}
      </button>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}

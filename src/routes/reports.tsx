import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Upload, Loader2, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { analyzeReport } from "@/lib/ai.functions";
import { STORE_KEYS, pushActivity, uid, useLocalStore, type ReportRecord } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Lab Report Analyzer | MedAssist AI" },
      {
        name: "description",
        content:
          "Upload a PDF or photo of your lab report and get a plain-language explanation with abnormal values highlighted.",
      },
      { property: "og:title", content: "Lab Report Analyzer | MedAssist AI" },
      {
        property: "og:description",
        content: "Blood sugar, cholesterol, CBC, liver and kidney values explained simply.",
      },
    ],
  }),
  component: ReportsPage,
});

const ACCEPT = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function ReportsPage() {
  const analyze = useServerFn(analyzeReport);
  const { value: reports, setValue } = useLocalStore<ReportRecord[]>(STORE_KEYS.reports, []);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<ReportRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!ACCEPT.includes(file.type)) {
      toast.error("Please upload a PDF, JPG or PNG file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File must be under 8 MB.");
      return;
    }
    setLoading(true);
    setCurrent(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });
      const res = await analyze({
        data: { engine: "gemini", fileName: file.name, mimeType: file.type, dataUrl },
      });
      const record: ReportRecord = {
        id: uid(),
        fileName: file.name,
        createdAt: Date.now(),
        summary: res.summary,
      };
      setCurrent(record);
      setValue((prev) => [record, ...prev].slice(0, 50));
      pushActivity({ type: "report", title: `Analyzed ${file.name}`, detail: "Lab report summary generated" });
      toast.success("Report analyzed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not analyze this report.");
    } finally {
      setLoading(false);
    }
  }

  function download(record: ReportRecord) {
    const blob = new Blob([`# ${record.fileName}\n\n${record.summary}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.fileName.replace(/\.[^.]+$/, "")}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          icon={FileText}
          title="Lab Report Analyzer"
          subtitle="Upload a PDF or photo of your report. Abnormal values are flagged ⚠️ and explained in everyday language."
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void handleFile(f);
          }}
          className="glass-card grid place-items-center border-2 border-dashed border-border p-12 text-center"
        >
          <motion.span
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow"
          >
            <Upload className="h-6 w-6" />
          </motion.span>
          <p className="mt-4 text-sm font-medium">Drag & drop your report here</p>
          <p className="text-xs text-muted-foreground">PDF, JPG or PNG • max 8 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {loading ? "Reading your report…" : "Choose file"}
          </button>
        </div>

        {loading && (
          <div className="glass-card mt-5 space-y-3 p-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded-full bg-muted"
                style={{ width: `${95 - i * 9}%` }}
              />
            ))}
          </div>
        )}

        {current && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-5 p-6"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="flex-1 text-lg font-semibold">{current.fileName}</h2>
              <button
                onClick={() => download(current)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" /> Download summary
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              >
                <Printer className="h-3.5 w-3.5" /> Save as PDF
              </button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.summary}</ReactMarkdown>
            </div>
          </motion.section>
        )}

        {reports.length > 0 && (
          <section className="glass-card mt-5 p-6">
            <h2 className="text-sm font-semibold">Previous reports</h2>
            <ul className="mt-3 divide-y divide-border/60">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <button onClick={() => setCurrent(r)} className="text-left hover:text-primary">
                    <span className="font-medium">{r.fileName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    onClick={() => download(r)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-accent"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

import { useState, useEffect } from 'react';
import { Briefcase, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = "http://localhost:5001/api/jobs";

function App() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [jobData, setJobData] = useState<any>(null);

  useEffect(() => {
    // Check if we are on a valid page and can extract
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, { action: "extract_job" }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded (e.g. page needs refresh)
            setMessage("Please refresh the page to use the extension.");
          } else if (response?.success) {
            setJobData(response.data);
            setMessage(`Found: ${response.data.title} at ${response.data.company}`);
          } else {
            setMessage(response?.error || "Could not extract job details.");
          }
        });
      } else {
        setMessage("Cannot run on this page.");
      }
    });
  }, []);

  const handleSaveJob = async () => {
    if (!jobData) return;
    
    setStatus("loading");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          description: jobData.description,
          sourceUrl: jobData.sourceUrl,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to save job");
      }

      setStatus("success");
      setMessage("Job saved successfully!");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to connect to CareerPilot");
    }
  };

  return (
    <div className="w-[320px] p-4 bg-background text-foreground font-sans border-border">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
          <Briefcase size={18} />
        </div>
        <h1 className="font-semibold text-lg">CareerPilot AI</h1>
      </div>

      <div className="space-y-4">
        {status === "idle" && (
          <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
            {message || "Checking page..."}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 p-3 rounded-md">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="break-words">{message}</span>
          </div>
        )}

        {jobData && status !== "success" && (
          <button
            onClick={handleSaveJob}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Job to CareerPilot"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

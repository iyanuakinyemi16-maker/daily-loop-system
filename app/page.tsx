"use client";

import { useEffect, useState } from "react";

interface Entry {
  id: string;
  date: string;
  energy: number;
  wins: string;
  misses: string;
  winCauses: string;
  missCauses: string;
  constraint: string;
  experiment: string;
  predicted: number;
  actual: number | null;
  outcome: string | null;
  error: number | null;
}

interface FormState {
  date: string;
  energy: string;
  wins: string;
  misses: string;
  winCauses: string;
  missCauses: string;
  constraint: string;
  experiment: string;
  predicted: string;
  outcome: string;
}

export default function DailyLoopTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().split("T")[0],
    energy: "",
    wins: "",
    misses: "",
    winCauses: "",
    missCauses: "",
    constraint: "",
    experiment: "",
    predicted: "",
    outcome: "",
  });

  const [viewMode, setViewMode] = useState<"chronological" | "error-sort">("chronological");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("daily_loop_entries");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when entries change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("daily_loop_entries", JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  const commitNightlyLog = () => {
    const required: (keyof FormState)[] = [
      "date",
      "energy",
      "wins",
      "misses",
      "winCauses",
      "missCauses",
      "constraint",
      "experiment",
      "predicted",
    ];

    if (required.some((f) => !form[f].trim())) {
      alert("All fields required.");
      return;
    }

    const newEntry: Entry = {
      id: generateId(),
      date: form.date,
      energy: Number(form.energy),
      wins: form.wins,
      misses: form.misses,
      winCauses: form.winCauses,
      missCauses: form.missCauses,
      constraint: form.constraint,
      experiment: form.experiment,
      predicted: Number(form.predicted),
      actual: null,
      outcome: null,
      error: null,
    };

    setEntries((prev) => [newEntry, ...prev]);

    setForm({
      date: new Date().toISOString().split("T")[0],
      energy: "",
      wins: "",
      misses: "",
      winCauses: "",
      missCauses: "",
      constraint: "",
      experiment: "",
      predicted: "",
      outcome: "",
    });
  };

  const saveActualScore = (id: string, value: string) => {
    const actualNum = Number(value);
    if (!value) return;

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          actual: actualNum,
          error: Math.abs(e.predicted - actualNum),
        };
      })
    );
  };

  const updateOutcome = (id: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, outcome: value } : e))
    );
  };

  const displayedEntries = [...entries].sort((a, b) => {
    if (viewMode === "error-sort") {
      return (b.error ?? -1) - (a.error ?? -1);
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 bg-secondary min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <h1 className="text-lg font-bold text-foreground tracking-tight">
          DAILY EXECUTION LOOP
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("chronological")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === "chronological"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setViewMode("error-sort")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === "error-sort"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            Error Sort
          </button>
        </div>
      </header>

      {/* Input Form */}
      <section className="bg-card p-4 border border-border rounded-xl space-y-3">
        <h2 className="text-sm font-semibold text-foreground mb-2">New Entry</h2>
        
        <input
          value={form.date}
          type="date"
          onChange={(e) => updateField("date", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Energy (1-10)"
          value={form.energy}
          onChange={(e) => updateField("energy", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          type="number"
          min="1"
          max="10"
        />
        
        <input
          placeholder="Predicted Score"
          value={form.predicted}
          onChange={(e) => updateField("predicted", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          type="number"
        />

        <input
          placeholder="Wins"
          value={form.wins}
          onChange={(e) => updateField("wins", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Misses"
          value={form.misses}
          onChange={(e) => updateField("misses", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Win Causes"
          value={form.winCauses}
          onChange={(e) => updateField("winCauses", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Miss Causes"
          value={form.missCauses}
          onChange={(e) => updateField("missCauses", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Constraint (1 rule)"
          value={form.constraint}
          onChange={(e) => updateField("constraint", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <input
          placeholder="Experiment"
          value={form.experiment}
          onChange={(e) => updateField("experiment", e.target.value)}
          className="w-full px-3 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          onClick={commitNightlyLog}
          className="w-full px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg active:scale-[0.98] transition-transform"
        >
          Commit Entry
        </button>
      </section>

      {/* Entries List */}
      <main className="space-y-3">
        {displayedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No entries yet. Add your first daily log above.
          </div>
        ) : (
          displayedEntries.map((e) => (
            <div
              key={e.id}
              className="border border-border p-4 rounded-xl bg-card space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{e.date}</span>
                <span className="text-muted-foreground">Energy: {e.energy}/10</span>
              </div>
              
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Wins:</span> {e.wins}
              </div>
              
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Misses:</span> {e.misses}
              </div>
              
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Constraint:</span> {e.constraint}
              </div>
              
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Experiment:</span> {e.experiment}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Predicted:</span>
                  <span className="font-medium text-foreground">{e.predicted}</span>
                </div>
                
                {e.actual === null ? (
                  <input
                    placeholder="Enter actual score"
                    type="number"
                    onChange={(ev) => saveActualScore(e.id, ev.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Actual:</span>{" "}
                      <span className="font-medium text-foreground">{e.actual}</span>
                    </span>
                    {e.error !== null && (
                      <span>
                        <span className="text-muted-foreground">Error:</span>{" "}
                        <span className="font-medium text-destructive">{e.error}</span>
                      </span>
                    )}
                  </div>
                )}

                <select
                  value={e.outcome || ""}
                  onChange={(ev) => updateOutcome(e.id, ev.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Outcome</option>
                  <option value="success">Success</option>
                  <option value="fail">Fail</option>
                  <option value="unclear">Unclear</option>
                </select>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

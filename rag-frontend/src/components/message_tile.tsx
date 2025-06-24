import { useState } from "react";
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { chatActions } from '../actions';

interface MessageTileProps {
  id: string;
  sender: "user" | "ai" | string;
  timestamp: string;
  executiveSummary?: string[];
  supportingFacts?: string[];
  answer?: string;
  text?: string | { query?: string };
  sources?: string[];
  revalidations?: {
    id: string;
    version: number;
    regenerated_response: string;
    regenerated_at: string;
  }[];
}

export default function MessageTile({
  id,
  sender,
  timestamp,
  executiveSummary,
  supportingFacts,
  answer,
  text,
  sources,
  revalidations: initialRevalidations,
}: MessageTileProps) {
  const isUser = sender === "user";
  const isAI = sender === "ai";
  const hasStructured = !!(
    answer ||
    (executiveSummary && executiveSummary.length) ||
    (supportingFacts && supportingFacts.length) ||
    (sources && sources.length)
  );

  // Safeguard: always render text as string
  let safeText: string = "";
  if (typeof text === "string") {
    safeText = text;
  } else if (text && typeof text === "object" && "query" in text && typeof text.query === "string") {
    safeText = text.query;
  } else if (text) {
    safeText = JSON.stringify(text);
  }

  // Show only first 2 supporting facts by default
  const [showAllFacts, setShowAllFacts] = useState(false);
  const factsToShow = supportingFacts && !showAllFacts ? supportingFacts.slice(0, 2) : supportingFacts;
  const hasMoreFacts = supportingFacts && supportingFacts.length > 2;

  // Format timestamp to a readable format
  let formattedTimestamp = timestamp;
  if (timestamp) {
    try {
      const date = new Date(timestamp);
      formattedTimestamp = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      formattedTimestamp = timestamp;
    }
  }

  // Revalidation state
  const [revalidations, setRevalidations] = useState(initialRevalidations || []);
  const [revalLoading, setRevalLoading] = useState(false);

  const handleRevalidate = async () => {
    if (revalLoading) return;
    setRevalLoading(true);
    try {
      const response = await chatActions.revalidateResponse(id);
      setRevalidations((prev) => [
        ...prev,
        {
          id: `${id}-reval-v${response.data.version}`,
          version: response.data.version,
          regenerated_response: response.data.regenerated_response,
          regenerated_at: response.data.regenerated_at,
        },
      ]);
    } catch (err) {
      // Optionally show error
    } finally {
      setRevalLoading(false);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-4xl ${isUser ? "flex-row-reverse" : "flex-row"} gap-3 w-full`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            {isUser ? (
              <User className="w-4 h-4 text-blue-600" />
            ) : (
              <Bot className="w-4 h-4 text-green-600" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div
            className={`rounded-2xl px-5 py-4 ${
              isUser
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            } flex flex-col gap-4`}
          >
            {/* User message */}
            {isUser && safeText && <p className="whitespace-pre-wrap leading-relaxed text-base">{safeText}</p>}

            {/* AI structured content */}
            {isAI && hasStructured && (
              <div className="flex flex-col gap-4">
                {/* Answer */}
                {answer && (
                  <section>
                    <h4 className="font-semibold text-base mb-1">Answer</h4>
                    <p className="whitespace-pre-wrap leading-relaxed text-base">{answer}</p>
                  </section>
                )}
                {/* Executive Summary */}
                {executiveSummary && executiveSummary.length > 0 && (
                  <section>
                    <h4 className="font-semibold text-base mb-1">Executive Summary</h4>
                    <div className="mt-1 space-y-1">
                      {executiveSummary.map((item, idx) => (
                        <pre key={idx} className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded p-2">
                          {item}
                        </pre>
                      ))}
                    </div>
                  </section>
                )}
                {/* Supporting Facts */}
                {factsToShow && factsToShow.length > 0 && (
                  <section>
                    <h4 className="font-semibold text-base mb-1">Supporting Facts</h4>
                    <div className="mt-1 space-y-2">
                      {factsToShow.map((fact, idx) => (
                        <pre key={idx} className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded p-2">
                          {fact}
                        </pre>
                      ))}
                    </div>
                    {hasMoreFacts && (
                      <button
                        className="mt-2 text-blue-600 dark:text-blue-400 text-xs underline hover:no-underline focus:outline-none"
                        onClick={() => setShowAllFacts((v) => !v)}
                      >
                        {showAllFacts ? "Show less" : `Show ${supportingFacts.length - 2} more`}
                      </button>
                    )}
                  </section>
                )}
                {/* Sources */}
                {sources && sources.length > 0 && (
                  <section>
                    <h4 className="font-semibold text-base mb-1">Sources</h4>
                    <ul className="list-disc ml-6 mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {sources.map((src, idx) => (
                        <li key={idx}>{src}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {/* Fallback for plain text if no structured fields */}
            {isAI && !hasStructured && safeText && (
              <p className="whitespace-pre-wrap leading-relaxed text-base">{safeText}</p>
            )}

            {/* Revalidations */}
            {isAI && Array.isArray(revalidations) && revalidations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Revalidated Responses:</p>
                <div className="space-y-2">
                  {revalidations.map((reval) => (
                    <div
                      key={reval.id}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2"
                    >
                      <div className="text-xs text-gray-700 dark:text-gray-200 mb-1">
                        <span className="font-semibold">Version {reval.version}:</span> {reval.regenerated_at}
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                        {reval.regenerated_response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp and Feedback */}
          <div className={`flex items-center mt-2 gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formattedTimestamp}</span>
            {isAI && (
              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Copy message">
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={revalLoading ? "Regenerating..." : "Regenerate response"}
                  onClick={handleRevalidate}
                  disabled={revalLoading}
                >
                  <RotateCcw className={`w-3 h-3 ${revalLoading ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Good response">
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Poor response">
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

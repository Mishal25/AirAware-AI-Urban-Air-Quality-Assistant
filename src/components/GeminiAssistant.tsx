import { AlertCircle, Bot, MessageSquare, RefreshCw, Send, User } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { askGeminiAssistant, fetchGeminiInsights } from '../services/api';
import {
  AirQualityResponse,
  AqiStandard,
  ChatMessage,
  GeminiHealthInsights,
} from '../types/airQuality';

interface GeminiAssistantProps {
  airQuality: AirQualityResponse;
  standard: AqiStandard;
  sectionRef?: React.RefObject<HTMLElement | null>;
  autoRefresh?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Is it safe to exercise outdoors right now?',
  'When is the best window to ventilate my home?',
  'What does the current PM2.5 and O3 level mean for children or asthma?',
];

export function GeminiAssistant({
  airQuality,
  standard,
  sectionRef,
  autoRefresh = true,
}: GeminiAssistantProps) {
  const [insights, setInsights] = useState<GeminiHealthInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadInsights = async (targetData: AirQualityResponse, targetStandard: AqiStandard) => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const result = await fetchGeminiInsights(targetData, targetStandard);
      setInsights(result);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : 'Unable to generate Gemini AI briefing.');
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    if (!autoRefresh) {
      setInsights(null);
      setInsightsError(null);
      setInsightsLoading(false);
      return;
    }

    let cancelled = false;
    setInsightsError(null);
    setInsightsLoading(true);

    fetchGeminiInsights(airQuality, standard)
      .then((result) => {
        if (!cancelled) {
          setInsights(result);
          setInsightsError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setInsights(null);
          setInsightsError(err instanceof Error ? err.message : 'Unable to generate Gemini AI briefing.');
        }
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [airQuality.location.id, airQuality.retrievedAt, standard, autoRefresh]);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const sendQuestion = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || chatLoading || trimmed.length > 800) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setChatLoading(true);

    try {
      const res = await askGeminiAssistant({
        question: trimmed,
        history: messages,
        airQuality,
        standard,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: res.timestamp,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Unable to reach Gemini AI assistant.',
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendQuestion(question);
  };

  const focusAskAi = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section
      ref={sectionRef}
      id="ai-assistant"
      aria-label="Your Personal Air Quality Advisor"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(13,148,136,0.16)] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
            <Bot className="w-4 h-4" aria-hidden="true" />
            <span>Powered by Google Gemini · Grounded in {airQuality.location.name} Readings</span>
          </div>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
            Your Personal Air Quality Advisor
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={focusAskAi}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ask AI</span>
          </button>

          <button
            type="button"
            onClick={() => void loadInsights(airQuality, standard)}
            disabled={insightsLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-teal-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
            <span>{insightsLoading ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gemini Summary, Precautions & Outdoor Activity Guidance */}
        <div className="lg:col-span-7 space-y-5">
          {insightsLoading && (
            <div className="space-y-4 animate-pulse" aria-live="polite" aria-busy="true">
              <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 bg-slate-100 rounded-xl" />
                <div className="h-28 bg-slate-100 rounded-xl" />
              </div>
            </div>
          )}

          {!insightsLoading && insightsError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 text-sm">
                <div className="font-semibold">AI Advisor Unavailable</div>
                <p className="mt-1 text-xs leading-relaxed text-rose-800">{insightsError}</p>
                <button
                  type="button"
                  onClick={() => void loadInsights(airQuality, standard)}
                  className="mt-2.5 px-3 py-1.5 text-xs font-medium bg-white border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {!insightsLoading && !insightsError && !insights && (
            <div className="p-5 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Manual AI Analysis Mode Enabled
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Click Generate Analysis to produce a Gemini health briefing for {airQuality.location.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadInsights(airQuality, standard)}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl whitespace-nowrap shrink-0"
              >
                Generate Analysis
              </button>
            </div>
          )}

          {!insightsLoading && insights && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">{insights.headline}</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {insights.plainLanguageSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="text-xs font-semibold text-teal-800">Key Atmospheric Driver</div>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                  {insights.dominantPollutantExplanation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2.5">
                    Health Precautions
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {insights.generalPrecautions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-700 font-mono text-xs mt-1">0{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2.5">
                    Sensitive Group Guidance
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {insights.sensitiveGroupAdvice.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-700 font-mono text-xs mt-1">0{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 mb-2.5">
                  Recommended Outdoor &amp; Indoor Actions
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {insights.actionableSteps.map((step, i) => (
                    <li
                      key={i}
                      className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-700 leading-relaxed"
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-800">Informational Disclaimer:</strong>{' '}
            {insights?.disclaimer ||
              'AirAware AI provides general environmental health guidance derived from live atmospheric readings. It is not a medical device and does not provide medical diagnoses.'}
          </div>
        </div>

        {/* Right: Interactive Q&A Chat */}
        <div className="lg:col-span-5 flex flex-col border border-slate-200 rounded-2xl bg-[#F8FAFC] overflow-hidden min-h-[420px]">
          <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ask Your Advisor</div>
              <div className="text-xs text-slate-500">
                Grounded in {airQuality.location.name}&apos;s live data
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ask about running, cycling, opening windows, N95 masks, or sensitive groups based on current measurements.
                </p>
                <div className="space-y-2">
                  <div className="text-[11px] font-medium text-slate-500">Quick prompts:</div>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendQuestion(q)}
                      disabled={chatLoading}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-teal-900 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : msg.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-900'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-teal-900 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-700" />
                <span>Consulting Gemini AI on live telemetry...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={800}
              placeholder="Ask about running, windows, masks..."
              aria-label="Ask AirAware AI a question"
              className="flex-1 h-10 px-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
            <button
              type="submit"
              disabled={!question.trim() || chatLoading}
              aria-label="Send question"
              className="h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

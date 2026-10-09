import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, History, Trash2, Plus } from "lucide-react";
import { navigate, Link } from "../../lib/router.jsx";
import { supabase } from "../../lib/supabase.js";
import { AppShell } from "../../components/AppShell.jsx";
import { Button, Modal, useToast } from "../../components/ui.jsx";
import { useChatSession, MessageList, Composer } from "./chatCore.jsx";

// Chatbot student-only gate lives server-side too (the edge function checks
// role itself), but the route/nav are gated here as well, same as every
// other student-only screen in this app.
//
// The conversation engine, transcript and composer are shared with the
// floating ChatWidget — see chatCore.jsx. This file is just the full-page
// framing around them (back button, history link, delete).
export default function Chatbot({ conversationId }) {
  const toast = useToast();
  const chat = useChatSession(conversationId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Prevent entire page / body scrolling so ONLY the message list scrolls.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  async function deleteThisConversation() {
    setConfirmDelete(false);
    if (!chat.convId) return;
    const { error } = await supabase.from("chatbot_conversations").delete().eq("id", chat.convId);
    if (error) { toast({ type: "error", title: "Couldn't delete", message: error.message }); return; }
    navigate("/chatbot/history");
  }

  function handleNewChat() {
    chat.reset();
    navigate("/chatbot");
  }

  return (
    <AppShell activeKey="chatbot" title="Fixi">
      <div className="flex flex-1 min-h-0 w-full flex-col overflow-hidden">
        {/* Clean floating conversation card */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-brd bg-surface shadow-xs">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-brd px-3.5 py-2.5 sm:px-5 sm:py-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate("/dashboard")}
                aria-label="Back"
                title="Back"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Sparkles size={16} />
              </div>
              <h2 className="text-base font-bold text-ink">Fixi</h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                title="New chat"
                aria-label="New chat"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Plus size={18} />
              </button>

              <Link
                to="/chatbot/history"
                title="History"
                aria-label="History"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <History size={18} />
              </Link>

              {chat.convId && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete"
                  title="Delete"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-danger-bg hover:text-danger"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </div>

          {/* Transcript */}
          <MessageList
            messages={chat.messages}
            streamText={chat.streamText}
            sending={chat.sending}
            loadingHistory={chat.loadingHistory}
            onPickSuggestion={(s) => chat.send(s)}
          />

          {/* Clean Composer */}
          <Composer
            text={chat.text}
            setText={chat.setText}
            sending={chat.sending}
            send={chat.send}
            stop={chat.stop}
          />
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this chat?"
        description="This conversation and all its messages will be permanently deleted. This can't be undone."
        icon={Trash2}
        tone="red"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteThisConversation}>Delete</Button>
          </>
        }
      />
    </AppShell>
  );
}

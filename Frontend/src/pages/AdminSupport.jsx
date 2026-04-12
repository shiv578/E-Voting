// frontend/src/pages/AdminSupport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Mail,
  MessageSquare,
  User,
  Clock,
  Filter,
  Search,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminSupport() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [statusFilter, setStatusFilter] = useState("open");
  const [search, setSearch] = useState("");

  const [replyForm, setReplyForm] = useState({
    subject: "",
    message: "",
    status: "closed",
  });
  const [replyBusy, setReplyBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMsg(null);
      try {
        // check admin
        const me = await api.get("/api/auth/me");
        if (me.data.user.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setUser(me.data.user);

        await fetchTickets("open");
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setMsg({
          type: "error",
          text: err?.response?.data?.msg || err.message,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  async function fetchTickets(status) {
    try {
      const res = await api.get(
        status === "all"
          ? "/api/support"
          : `/api/support?status=${status}`
      );
      setTickets(res.data.tickets || []);
      setSelected(null);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  function handleSelect(ticket) {
    setSelected(ticket);
    setReplyForm({
      subject: ticket.responseSubject || `Re: ${ticket.subject}`,
      message: ticket.responseBody || "",
      status: ticket.status === "closed" ? "closed" : "closed",
    });
  }

  const filtered = tickets.filter((t) => {
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      t.name.toLowerCase().includes(s) ||
      t.email.toLowerCase().includes(s) ||
      (t.subject || "").toLowerCase().includes(s) ||
      (t.category || "").toLowerCase().includes(s)
    );
  });

  async function handleSendReply(e) {
    e.preventDefault();
    if (!selected) return;
    setReplyBusy(true);
    setMsg(null);

    try {
      const payload = {
        subject: replyForm.subject,
        message: replyForm.message,
        status: replyForm.status,
      };
      const res = await api.post(
        `/api/support/${selected._id}/reply`,
        payload
      );

      setMsg({ type: "success", text: res.data.msg || "Reply sent." });

      // refresh tickets with current filter
      await fetchTickets(statusFilter);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setReplyBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
          <Loader2 className="animate-spin" /> Loading Support Inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center border border-blue-100 rounded-full w-14 h-14 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
              <MessageSquare className="text-[#0B2447] dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                Support Inbox
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View contact messages and reply via email.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm md:text-sm hover:bg-gray-50 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
            >
              <ArrowLeft size={16} />
              Back to Admin Panel
            </button>
          </div>
        </div>

        {/* Global message */}
        {msg && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
            {msg.text}
          </div>
        )}

        {/* Layout: list + details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: list */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-4 flex flex-col lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tickets
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusFilter(val);
                  fetchTickets(val);
                }}
                className="px-2 py-1 text-xs border rounded bg-gray-50 dark:bg-[#111] border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search by name, email, subject..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#0B2447] dark:focus:ring-yellow-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={14}
                className="absolute text-gray-400 left-2.5 top-2.5"
              />
            </div>

            <div className="flex-1 overflow-auto max-h-[520px] divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <p className="py-6 text-xs text-center text-gray-500">
                  No tickets found for this filter.
                </p>
              ) : (
                filtered.map((t) => {
                  const created = t.createdAt
                    ? new Date(t.createdAt).toLocaleString()
                    : "";
                  const isActive = selected && selected._id === t._id;

                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => handleSelect(t)}
                      className={`w-full text-left px-3 py-3 flex flex-col gap-1 text-xs border-l-4 ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600"
                          : "bg-white dark:bg-[#1a1a1a] border-transparent hover:bg-gray-50 dark:hover:bg-[#111]"
                      } transition-colors`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User
                            size={14}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          <span className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[140px]">
                            {t.name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === "open"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : t.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {t.subject}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} />
                        {created}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Right: details + reply */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 lg:col-span-2 flex flex-col">
            {!selected ? (
              <div className="flex items-center justify-center flex-1 text-sm text-gray-500 dark:text-gray-400">
                Select a ticket from the left to view details and reply.
              </div>
            ) : (
              <>
                {/* Ticket details */}
                <div className="pb-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                      <Mail size={20} className="text-[#0B2447] dark:text-yellow-400" />
                      {selected.subject}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        selected.status === "open"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : selected.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    From:{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selected.name} &lt;{selected.email}&gt;
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#111]">
                      Category:{" "}
                      <span className="font-semibold">{selected.category}</span>
                    </span>
                    {selected.createdAt && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-[#111]">
                        <Clock size={10} />
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 p-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md dark:bg-[#111] dark:border-zinc-700 dark:text-gray-100 whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                {/* Reply form */}
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
                      Reply Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400"
                      value={replyForm.subject}
                      onChange={(e) =>
                        setReplyForm((s) => ({
                          ...s,
                          subject: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
                      Reply Message (email body)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 min-h-[140px]"
                      value={replyForm.message}
                      onChange={(e) =>
                        setReplyForm((s) => ({
                          ...s,
                          message: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        Mark ticket as:
                      </span>
                      <select
                        className="px-2 py-1 text-xs border rounded bg-gray-50 dark:bg-[#111] border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200"
                        value={replyForm.status}
                        onChange={(e) =>
                          setReplyForm((s) => ({
                            ...s,
                            status: e.target.value,
                          }))
                        }
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={replyBusy}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#0B2447] rounded-lg shadow-md hover:bg-[#1a3a5e] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                    >
                      {replyBusy ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          Send Email Reply
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

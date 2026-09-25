"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ClientRow {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function AdminClientListPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState("");

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOwnerCode, setEditOwnerCode] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  function load() {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []));
  }

  useEffect(load, []);

  function startEditClient(c: ClientRow) {
    setEditingClientId(c.id);
    setEditName(c.name);
    setEditOwnerCode("");
    setEditMsg("");
  }

  function cancelEditClient() {
    setEditingClientId(null);
    setEditName("");
    setEditOwnerCode("");
    setEditMsg("");
  }

  async function saveEditClient(id: string) {
    setEditBusy(true);
    setEditMsg("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, ownerCode: editOwnerCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMsg(data.error ?? "Gagal menyimpan.");
        return;
      }
      cancelEditClient();
      load();
    } finally {
      setEditBusy(false);
    }
  }

  async function removeClient(c: ClientRow) {
    if (!confirm(`Hapus akun Channel/Client "${c.name}" (${c.code})? Semua data ledger-nya ikut terhapus.`)) return;
    const code = window.prompt("Masukkan Kode Owner untuk menghapus:");
    if (!code) return;
    const res = await fetch(`/api/clients/${c.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerCode: code }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Gagal menghapus.");
      return;
    }
    load();
  }

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Gagal menyimpan.");
        return;
      }
      setSuccess(`✓ Client/Channel ${data.code} berhasil didaftarkan.`);
      setName("");
      setEmail("");
      setPhone("");
      load();
      setTimeout(() => setSuccess(""), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="pb-4 border-b border-[var(--line)]">
        <div className="text-[24px] font-semibold leading-[1.1]">Data Client / Channel</div>
        <div className="text-[11.5px] text-[var(--dim)] mt-1.5">
          Partner (Mami/Channel) yang login lewat aplikasi Channel mereka sendiri — GPS tercatat setiap login.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_1.4fr] gap-4 pt-5.5">
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl h-fit">
          <div className="text-[16px] font-semibold text-[var(--gold2)] mb-3.5">Daftarkan Client/Channel</div>
          <div className="grid gap-3.5">
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Nama (mis. Mami Ariel)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.14em] uppercase text-[var(--dim)] mb-1.5 block">Nomor HP Aktif</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full py-2.5 px-3.5 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px]"
              />
            </div>
          </div>
          {success && <div className="mt-3.5 text-[12px] text-[var(--green)]">{success}</div>}
          {msg && <div className="mt-3.5 text-[11.5px] text-[var(--red)]">{msg}</div>}
          <button
            disabled={busy || !name || !email || !phone}
            onClick={submit}
            className="mt-3.5 py-2.5 px-5 rounded-[10px] text-[11px] font-bold tracking-[0.14em] uppercase cursor-pointer disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
          >
            Daftarkan
          </button>
          <div className="text-[10.5px] text-[var(--faint)] mt-3 leading-[1.6]">
            Client login di aplikasi Channel (URL terpisah) pakai email/HP ini dengan kode OTP.
          </div>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl h-fit">
          <div className="text-[16px] font-semibold text-[var(--gold2)] mb-3.5">Daftar Client/Channel</div>
          <div className="flex flex-col gap-2">
            {clients.length === 0 && <div className="text-[12.5px] text-[var(--faint)]">Belum ada client/channel terdaftar.</div>}
            {clients.map((c) =>
              editingClientId === c.id ? (
                <div key={c.id} className="p-3.5 bg-[var(--surface2)] border border-[var(--goldline)] rounded-[11px]">
                  <label className="text-[9.5px] tracking-[0.12em] uppercase text-[var(--dim)] mb-1 block">Nama</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full py-2 px-3 bg-black/30 border border-[var(--line)] rounded-[9px] text-[12.5px] mb-2"
                  />
                  <label className="text-[9.5px] tracking-[0.12em] uppercase text-[var(--gold)] mb-1 block">Kode Owner</label>
                  <input
                    type="password"
                    value={editOwnerCode}
                    onChange={(e) => setEditOwnerCode(e.target.value)}
                    placeholder="Wajib diisi untuk simpan perubahan"
                    className="w-full py-2 px-3 bg-black/30 border border-[var(--goldline)] rounded-[9px] text-[12.5px]"
                  />
                  {editMsg && <div className="text-[11px] text-[var(--red)] mt-2">{editMsg}</div>}
                  <div className="flex gap-2 mt-2.5">
                    <button
                      disabled={editBusy || !editName || !editOwnerCode}
                      onClick={() => saveEditClient(c.id)}
                      className="py-1.5 px-3.5 rounded-[8px] text-[10.5px] font-bold tracking-[0.1em] uppercase cursor-pointer disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "#1a1200" }}
                    >
                      Simpan
                    </button>
                    <button
                      onClick={cancelEditClient}
                      className="py-1.5 px-3.5 bg-[var(--surface)] border border-[var(--line)] rounded-[8px] text-[var(--dim)] text-[10.5px] font-bold tracking-[0.1em] uppercase cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={c.id}
                  className="flex justify-between items-center gap-2.5 p-3.5 bg-[var(--surface2)] border border-[var(--line)] rounded-[11px] text-[12.5px]"
                >
                  <Link href={`/admin/${c.id}`} className="flex-1 min-w-0 hover:opacity-90 transition">
                    <div className="text-[var(--gold2)] font-semibold text-[14px]">
                      {c.name} <span className="text-[var(--dim)] text-[11px] font-normal">({c.code})</span>
                    </div>
                    <div className="text-[10.5px] text-[var(--dim)] mt-1">
                      {c.email} · {c.phone}
                    </div>
                  </Link>
                  <span
                    className={`inline-block py-1 px-2.5 rounded-full text-[9.5px] tracking-[0.12em] uppercase whitespace-nowrap border shrink-0 ${
                      c.status === "AKTIF"
                        ? "text-[var(--green)] bg-[rgba(74,222,128,.12)] border-[rgba(74,222,128,.3)]"
                        : "text-[var(--red)] bg-[rgba(226,102,95,.12)] border-[rgba(226,102,95,.3)]"
                    }`}
                  >
                    {c.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                  </span>
                  <div className="flex gap-2.5 shrink-0">
                    <button onClick={() => startEditClient(c)} className="text-[var(--gold)] text-[12px] cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => removeClient(c)} className="text-[var(--red)] text-[12px] cursor-pointer">
                      Hapus
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

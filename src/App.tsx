import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  Eye,
  Gift,
  Headphones,
  Home,
  Infinity as InfinityIcon,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  ShieldCheck,
  Star,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { signInWithGoogle } from "./firebase";

type Screen = "dashboard" | "packages" | "packageDetail" | "referrals" | "profile" | "auth" | "tasks" | "history" | "changePassword";
type Plan = { name: string; price: string; claim: string; tone: "green" | "gold" | "silver" | "bronze"; caption: string; popular?: boolean };
type AccountStats = { balance: number; taskBalance: number; today: number; referrals: number; withdrawn: number; deposit: number };
type WithdrawRequest = { method: string; name: string; number: string; amount: number };
type HistoryEntry = { type: "claim" | "withdraw" | "referral" | "deposit"; title: string; amount: number; detail: string; date: string };

const formatPkr = (amount: number) => `Rs ${amount.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const todayLabel = () => new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
const whatsappChannelLink = "https://whatsapp.com/channel/0029Va0000000000000000";

const packagePlans: Plan[] = [
  { name: "Free Plan", price: "0", claim: "16", tone: "green", caption: "Lifetime plan" },
  { name: "VIP 1", price: "225", claim: "70", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 2", price: "500", claim: "150", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 3", price: "800", claim: "220", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 4", price: "1,500", claim: "450", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 5", price: "2,500", claim: "750", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 6", price: "3,500", claim: "950", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 7", price: "5,000", claim: "1,400", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 8", price: "8,000", claim: "2,250", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 9", price: "10,000", claim: "2,700", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 10", price: "15,000", claim: "4,100", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 11", price: "20,000", claim: "5,400", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 12", price: "30,000", claim: "8,100", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 13", price: "50,000", claim: "13,500", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 14", price: "75,000", claim: "20,000", tone: "bronze", caption: "Lifetime plan" },
  { name: "VIP 15", price: "100,000", claim: "27,000", tone: "gold", caption: "Lifetime plan", popular: true },
];

const referralRows = [
  { name: "Ali Raza", date: "May 28, 2024", pkg: "10,000 PKR Package", earn: "+ PKR 4,000", color: "from-indigo-200 to-sky-100" },
  { name: "Sana Khan", date: "May 26, 2024", pkg: "5,000 PKR Package", earn: "+ PKR 2,000", color: "from-emerald-200 to-rose-100" },
  { name: "Usman Javed", date: "May 20, 2024", pkg: "2,500 PKR Package", earn: "+ PKR 1,000", color: "from-zinc-200 to-slate-100" },
];

const paymentAccounts = [
  { method: "EasyPaisa", name: "TEHSIN ULLAH", number: "03019016682" },
  { method: "JazzCash", name: "TEHSIN ULLAH", number: "03019016682" },
  { method: "NayaPay", name: "TEHSIN ULLAH", number: "03319397920" },
  { method: "SadaPay", name: "TEHSIN ULLAH", number: "03019016682" },
];

const tabs: { id: Screen; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "packages", label: "Packages" },
  { id: "referrals", label: "Referrals" },
  { id: "profile", label: "Profile" },
  { id: "auth", label: "Login" },
  { id: "tasks", label: "Tasks" },
];

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl border-2 ${dark ? "border-amber-300 text-amber-300" : "border-emerald-700 text-emerald-700"}`}>
        <BarChart3 className="h-8 w-8" />
      </div>
      <div className="leading-none">
        <div className={`text-4xl font-black tracking-tight ${dark ? "text-white" : "text-zinc-950"}`}>Earn<span className={dark ? "text-amber-300" : "text-emerald-600"}>Pro</span></div>
        <div className={`mt-2 text-[11px] font-bold uppercase tracking-[0.34em] ${dark ? "text-slate-300" : "text-zinc-500"}`}>Earn smart, live better</div>
      </div>
    </div>
  );
}

function WealthLogo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative h-12 w-12 rounded-full border-2 border-amber-300 text-amber-300">
        <BarChart3 className="absolute bottom-1 left-2 h-8 w-8" />
      </div>
      <div>
        <div className="text-3xl font-black text-white">Wealth<span className="text-amber-300">Grow</span></div>
        <div className="text-sm uppercase tracking-[0.38em] text-slate-200">Invest & Grow</div>
      </div>
    </div>
  );
}

function TopTabs({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) {
  return (
    <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/85 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-black text-emerald-900"><BarChart3 /> EarnPro UI</div>
        <div className="flex gap-2 overflow-x-auto rounded-full bg-emerald-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${active === tab.id ? "bg-emerald-700 text-white shadow-lg shadow-emerald-200" : "text-emerald-900 hover:bg-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`mx-auto min-h-[calc(100vh-74px)] w-full max-w-[760px] overflow-hidden bg-white shadow-2xl shadow-emerald-950/10 ${className}`}
    >
      {children}
    </motion.main>
  );
}

function Dashboard({ onNavigate, stats, activePlan }: { onNavigate: (screen: Screen) => void; stats: AccountStats; activePlan: Plan | null }) {
  const moneyCards = [
    { title: "Total Balance", amount: formatPkr(stats.balance), label: "View Balance", icon: Wallet },
    { title: "Today Task Earning", amount: formatPkr(stats.today), label: activePlan ? "View Tasks" : "Buy Package", icon: ClipboardCheck },
    { title: "Referral Commission", amount: formatPkr(stats.referrals), label: "View Referrals", icon: Users },
    { title: "Total Withdraw", amount: formatPkr(stats.withdrawn), label: "View Withdrawals", icon: Wallet },
  ];
  return (
    <Shell>
      <header className="flex items-center justify-between px-8 py-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("packages")}><Menu className="h-9 w-9 text-emerald-800" /></motion.button>
        <Logo />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("tasks")} className="relative">
          <Bell className="h-9 w-9 text-emerald-800" />
          <span className="absolute -right-4 -top-4 grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-xl font-black text-white">3</span>
        </motion.button>
      </header>

      <div className="mx-7 mb-7 flex items-center gap-5 rounded-full bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-900 px-5 py-4 text-white shadow-xl shadow-emerald-900/20">
        <span className="rounded-xl bg-red-600 px-4 py-2 font-black"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-white" />LIVE</span>
        <b className="text-lg">NEWS:</b>
        <p className="min-w-0 flex-1 truncate text-lg">Bonus offer is live! Complete tasks & earn more today</p>
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <Pause className="h-6 w-6" />
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-900 px-8 py-10 text-white">
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute inset-0 opacity-30">
          <div className="absolute bottom-0 left-10 h-48 w-[620px] rounded-[50%] border border-emerald-300/30" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-300/10" />
        </motion.div>
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-bold">Welcome back,</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight">Rohan Patel</h1>
            <div className="mt-8 inline-flex items-center gap-4 rounded-xl bg-white/95 px-5 py-4 text-2xl font-semibold text-emerald-700 shadow-xl">
              <ShieldCheck className="h-11 w-11 fill-emerald-600/10" /> {activePlan ? `${activePlan.name} Active` : "No Package Active"}
            </div>
          </div>
          <div className="relative grid h-36 w-36 place-items-center rounded-full bg-white/20 ring-1 ring-white/25">
            <User className="h-24 w-24" />
            <span className="absolute -bottom-1 -right-1 grid h-16 w-16 place-items-center rounded-full bg-green-500"><Check className="h-10 w-10" /></span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 bg-white px-7 py-9 sm:grid-cols-2">
        {moneyCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-lg shadow-zinc-200/50">
              <div className="flex items-start justify-between">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon className="h-12 w-12" /></div>
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BarChart3 /></div>
              </div>
              <p className="mt-8 text-2xl text-zinc-500">{card.title}</p>
              <h2 className="mt-4 text-4xl font-black text-emerald-900">{card.amount}</h2>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => onNavigate(card.title.includes("Task") ? "tasks" : card.title.includes("Referral") ? "referrals" : card.title.includes("Withdraw") ? "profile" : "packages")} className="mt-7 flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-xl font-bold text-emerald-700">
                <span className="flex items-center gap-4"><Icon />{card.label}</span><ChevronRight />
              </motion.button>
            </motion.div>
          );
        })}
      </section>

      {!activePlan && <div className="px-7 pb-8">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNavigate("packages")} className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-6 text-left shadow-lg shadow-amber-100">
          <p className="text-2xl font-black text-amber-900">Package buy karein</p>
          <p className="mt-2 text-lg text-amber-800">Abhi ads locked hain. Package activate karne ke baad Daily Tasks mein ad dekh kar claim kar sakte hain.</p>
        </motion.button>
      </div>}

      <div className="px-7 pb-8">
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-emerald-700 to-green-600 p-7 text-white shadow-xl shadow-emerald-200">
          <div className="flex items-center gap-7"><div className="grid h-24 w-24 place-items-center rounded-full bg-white/15"><Phone className="h-12 w-12" /></div><div><h3 className="text-2xl font-black">WhatsApp Updates</h3><p className="mt-2 text-xl">Join our official channel</p></div></div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => window.open(whatsappChannelLink, "_blank", "noopener,noreferrer")} className="flex items-center gap-4 rounded-2xl bg-white px-9 py-5 text-xl font-black text-emerald-800">Join Channel <ChevronRight /></motion.button>
        </div>
      </div>
      <BottomNav active="Dashboard" onNavigate={onNavigate} />
    </Shell>
  );
}

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (plan: Plan) => void }) {
  const isFree = plan.price === "0";
  const accent = isFree ? "from-emerald-500 to-teal-500" : "from-orange-500 to-rose-500";
  const minWithdraw = isFree ? "150" : "20";
  return (
    <motion.div whileHover={{ y: -4 }} className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-[#07111f] p-6 shadow-2xl shadow-black/30">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="relative flex items-start justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className={`grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
            {isFree ? <Star className="h-12 w-12" /> : <Trophy className="h-12 w-12" />}
          </div>
          <div>
            <h3 className="text-4xl font-black text-white">{plan.name}</h3>
            <p className="mt-2 text-lg font-bold uppercase tracking-[0.18em] text-slate-400">Lifetime Plan</p>
          </div>
        </div>
        <div className={isFree ? "rounded-full border border-emerald-500 px-5 py-2 font-black text-emerald-400" : "text-3xl font-black text-orange-500"}>{isFree ? "FREE" : `Rs${plan.price}`}</div>
      </div>

      <div className="relative mt-8 grid grid-cols-3 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/50 text-center">
        <div className="p-5"><p className="text-sm uppercase tracking-widest text-slate-400">Invest</p><b className="mt-3 block text-2xl text-white">{isFree ? "FREE" : plan.price}<span className="ml-1 text-sm font-medium text-slate-400">PKR</span></b></div>
        <div className="bg-blue-950/70 p-5"><p className="text-sm uppercase tracking-widest text-slate-400">Daily</p><b className="mt-3 block text-2xl text-blue-400">{plan.claim}<span className="ml-1 text-sm font-medium">PKR</span></b></div>
        <div className="p-5"><p className="text-sm uppercase tracking-widest text-slate-400">Total</p><b className="mt-3 block text-2xl text-white">Unlimited</b></div>
      </div>

      <div className="relative mt-7 grid gap-4 text-lg text-white sm:grid-cols-2">
        {["Daily Withdrawal", "No Referral Required", "Lifetime validity", `Daily profit Rs${plan.claim}`, `Min Withdrawal: ${minWithdraw} PKR`].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-500" /><span>{item}</span></div>)}
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={() => onSelect(plan)} className={`relative mt-8 w-full rounded-2xl bg-gradient-to-r ${accent} py-5 text-2xl font-black text-white shadow-lg`}>
        {isFree ? "Activate Free" : `Invest Rs${plan.price}`}
      </motion.button>
    </motion.div>
  );
}

function Packages({ onSelect }: { onSelect: (plan: Plan) => void }) {
  return (
    <Shell className="bg-[#050a14] text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#07111f]/95 px-8 py-8 backdrop-blur">
        <h1 className="text-4xl font-black">Investment Plans</h1>
        <div className="relative"><Bell className="h-9 w-9" /><span className="absolute -right-4 -top-4 grid h-9 w-9 place-items-center rounded-full bg-red-500 text-lg font-black">1</span></div>
      </header>
      <section className="px-8 py-8">
        <div className="rounded-3xl border border-blue-900/70 bg-blue-950/20 p-7 shadow-lg shadow-blue-950/20">
          <p className="text-xl font-black uppercase tracking-[0.35em] text-blue-500">Investment Plans</p>
          <p className="mt-4 text-2xl leading-relaxed text-slate-300">Choose a plan and start earning daily. All plans include daily withdrawal and no referral required.</p>
        </div>
      </section>
      <section className="space-y-7 px-8 pb-10">
        {packagePlans.map((plan) => <PlanCard key={plan.name} plan={plan} onSelect={onSelect} />)}
      </section>
      <footer className="grid grid-cols-2 gap-6 px-8 pb-8 text-slate-200 sm:grid-cols-4">
        {["Secure & Trusted", "Transparent & Reliable", "Your Security Our Priority", "24/7 Support"].map((item, i) => <div key={item} className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-amber-300">{i === 3 ? <Headphones /> : <ShieldCheck />}</span><span>{item}</span></div>)}
      </footer>
    </Shell>
  );
}

function PackageDetail({ plan, onBack, onActivate, activePlan, depositBalance, onDeposit }: { plan: Plan; onBack: () => void; onActivate: (plan: Plan) => void; activePlan: Plan | null; depositBalance: number; onDeposit: (amount: number) => void }) {
  const price = Number(plan.price.replace(/,/g, ""));
  const commission = Math.round(price * 0.4).toLocaleString();
  const needsDeposit = price > 0 && depositBalance < price;
  const [selectedPayment, setSelectedPayment] = useState(paymentAccounts[0].method);
  const [screenshotName, setScreenshotName] = useState("");
  const features = [
    [Wallet, `Daily earning ${plan.claim} PKR`],
    [InfinityIcon, "Unlimited earning potential"],
    [Upload, "Daily withdraw limit available"],
    [Users, "No referral required"],
    [ShieldCheck, "Lifetime validity"],
    [CheckCircle2, plan.price === "0" ? "Minimum withdraw 200 PKR" : "Minimum withdraw 50 PKR"],
  ] as const;

  return (
    <Shell className="bg-[#041a2e] text-white">
      <header className="flex items-center justify-between px-8 py-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="grid h-14 w-14 place-items-center rounded-full bg-white/10"><ArrowLeft /></motion.button>
        <WealthLogo />
        <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-300 text-slate-950"><Star className="fill-slate-950" /></div>
      </header>
      <section className="px-8 pb-10">
        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2rem] border border-amber-300/50 bg-gradient-to-br from-slate-950 to-slate-900 p-8 shadow-2xl shadow-black/40">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-amber-300">Selected Package</p>
              <h1 className="mt-2 text-5xl font-black">{plan.name}</h1>
              <p className="mt-3 text-2xl text-slate-300">Package price: <b className="text-amber-300">{plan.price === "0" ? "FREE" : `${plan.price} PKR`}</b></p>
            </div>
            <div className="rounded-2xl bg-amber-300 px-6 py-5 text-right text-slate-950">
              <p className="text-sm font-bold uppercase">Daily</p>
              <b className="text-4xl">{plan.claim}</b>
              <p className="font-bold">PKR</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {features.map(([Icon, label]) => (
              <motion.div key={label} whileHover={{ x: 6 }} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xl text-slate-200">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-300/10 text-amber-300"><Icon /></span>
                {label}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-emerald-500/10 p-5 text-emerald-100 ring-1 ring-emerald-400/20">
            Referral commission is 40% of package price. For this package your referral bonus will be <b className="text-emerald-300">{commission} PKR</b>.
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-4"><span className="text-slate-300">Deposit balance for package purchase</span><b className="text-2xl text-amber-300">{formatPkr(depositBalance)}</b></div>
            {needsDeposit && <p className="mt-3 text-amber-200">Package activate karne ke liye deposit proof submit karein.</p>}
            {price > 0 && <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {paymentAccounts.map((account) => <motion.button whileTap={{ scale: 0.97 }} key={account.method} onClick={() => setSelectedPayment(account.method)} className={`rounded-2xl p-4 text-left ring-1 transition ${selectedPayment === account.method ? "bg-amber-300 text-slate-950 ring-amber-200" : "bg-slate-950/40 text-slate-200 ring-white/10"}`}>
                  <b className="block text-lg">{account.method}</b>
                  <span className="mt-1 block text-sm opacity-80">Name: {account.name}</span>
                  <span className="block text-sm opacity-80">Number: {account.number}</span>
                </motion.button>)}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-amber-300/40 bg-slate-950/40 p-5">
                <p className="font-bold text-amber-200">Deposit {plan.price} PKR, phir screenshot upload karein</p>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 text-slate-800">
                  <span className="truncate">{screenshotName || "Upload payment screenshot"}</span>
                  <Upload className="text-emerald-700" />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setScreenshotName(event.target.files?.[0]?.name ?? "")} />
                </label>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => screenshotName ? onDeposit(price) : undefined} className={`mt-4 w-full rounded-xl py-4 font-black ${screenshotName ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-400"}`}>Submit Deposit Proof</motion.button>
              </div>
            </>}
          </div>

          <motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} onClick={() => onActivate(plan)} className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-5 text-2xl font-black text-white shadow-xl shadow-emerald-950/30">
            {activePlan?.name === plan.name ? "Already Active" : plan.price === "0" ? "Activate Free Package" : needsDeposit ? "Add Deposit To Buy" : `Buy ${plan.price} PKR Package`}
          </motion.button>
        </motion.div>
      </section>
    </Shell>
  );
}

function Referrals({ stats, activePlan, onAction }: { stats: AccountStats; activePlan: Plan | null; onAction: (message: string) => void }) {
  const referralCommission = activePlan ? Math.round(Number(activePlan.price.replace(/,/g, "")) * 0.4) : 0;
  const howSteps: Array<[typeof Copy, string, string]> = [
    [Copy, "Share Your Link", "Share your unique referral link with friends."],
    [UserPlus, "Friend Joins", "Your friend signs up using your link."],
    [Wallet, "They Purchase", "Your friend purchases any package."],
    [Gift, "You Earn", "You earn 40% commission as bonus."],
  ];
  return (
    <Shell>
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-violet-800 px-8 pb-32 pt-10 text-center text-white">
        <ArrowLeft className="absolute left-8 top-10 h-9 w-9" />
        <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-8 top-24 text-amber-300"><Gift className="h-28 w-28" /></motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute right-10 top-20 text-amber-300"><Gift className="h-28 w-28" /></motion.div>
        <h1 className="text-5xl font-black">Invite Friends,<br /><span className="text-amber-300">Earn Rewards!</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-xl text-violet-100">Share your link and earn exciting commissions when your friends join.</p>
      </section>

      <section className="-mt-24 space-y-7 px-8 pb-10">
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-violet-200/60">
          <h2 className="text-3xl font-black text-slate-900">Your Referral Link</h2>
          <div className="mt-6 flex gap-4">
            <div className="flex-1 rounded-2xl border-2 border-dashed border-violet-200 px-5 py-5 text-xl font-semibold text-violet-600">https://app.example.com/ref/ahmed123</div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onAction("Referral link copied.")} className="flex items-center gap-3 rounded-2xl bg-violet-600 px-7 text-xl font-black text-white shadow-lg shadow-violet-300"><Copy /> Copy</motion.button>
          </div>
          <p className="mt-5 flex items-center gap-3 text-lg text-slate-500"><ShieldCheck className="text-violet-600" /> Anyone with this link can join and you earn a 40% commission. Current: <b className="text-violet-600">{formatPkr(stats.referrals)}</b></p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-3 text-2xl font-black text-slate-900"><Users className="text-violet-600" />Referral History</h2><motion.button whileTap={{ scale: 0.95 }} onClick={() => onAction("No more referral records yet.")} className="flex items-center text-lg font-bold text-violet-600">View All <ChevronRight /></motion.button></div>
          <div className="rounded-2xl border border-slate-100 p-4">
            {referralRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[70px_1fr_auto_24px] items-center gap-4 border-b border-slate-100 py-4 last:border-0">
                <div className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${row.color}`}><User className="h-9 w-9 text-slate-700" /></div>
                <div><b className="text-xl text-slate-950">{row.name}</b><p className="mt-1 text-slate-500"><span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">Joined</span> · {row.date}</p></div>
                <div className="text-right"><b className="text-xl text-emerald-600">{row.earn}</b><p className="text-slate-500">{row.pkg}</p></div>
                <ChevronRight className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_1.5fr]">
            <div><p className="text-xl font-bold text-slate-700">Your Earnings</p><h2 className="mt-3 text-3xl font-black text-slate-950">High Commission,<br />Bigger <span className="text-violet-600">Rewards!</span></h2><p className="mt-4 text-lg text-slate-500">The more your friends join, the more you earn.</p><Wallet className="mt-10 h-28 w-28 text-violet-600" /></div>
            <div className="flex items-end justify-between gap-4 pt-14">
              {[400, 1000, 2000, 4000].map((v, i) => <div key={v} className="text-center"><b className="text-slate-900">PKR {i === 0 ? "1,000" : i === 1 ? "2,500" : i === 2 ? "5,000" : "10,000"}</b><div style={{ height: 58 + i * 28 }} className={`mt-3 grid w-20 place-items-center rounded-xl text-white ${i === 0 ? "bg-blue-500" : i === 1 ? "bg-emerald-500" : i === 2 ? "bg-orange-500" : "bg-violet-600"}`}><span className="font-black">{v}</span></div><p className="mt-2 text-slate-500">Package</p></div>)}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-5 rounded-2xl bg-amber-50 p-5 text-lg text-slate-700"><Gift className="h-12 w-12 text-violet-600" />{activePlan ? <>Your active package referral bonus example: <b className="text-violet-600">{referralCommission.toLocaleString()} PKR</b> (40% of {activePlan.price} PKR).</> : <>Example: When your friend purchases a <b className="text-violet-600">10,000 PKR</b> package, you earn <b className="text-violet-600">4,000 PKR</b> as bonus.</>}</div>
        </div>
        <div>
          <h2 className="mb-5 flex items-center gap-3 text-3xl font-black text-slate-900">How It Works</h2>
          <div className="grid gap-5 sm:grid-cols-4">
            {howSteps.map(([StepIcon, title, text], index) => {
              return <div key={String(title)} className="relative rounded-3xl bg-white p-5 text-center shadow-lg shadow-slate-200"><span className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-violet-600 font-black text-white">{index + 1}</span><div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-violet-50 text-violet-600"><StepIcon className="h-10 w-10" /></div><h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3><p className="mt-2 text-slate-500">{text}</p></div>;
            })}
          </div>
        </div>
      </section>
    </Shell>
  );
}

function Profile({ onNavigate, stats, activePlan, onWithdraw, onHistory }: { onNavigate: (screen: Screen) => void; stats: AccountStats; activePlan: Plan | null; onWithdraw: (request: WithdrawRequest) => void; onHistory: (filter: string) => void }) {
  const methods = ["EasyPaisa", "JazzCash", "NayaPay", "SadaPay"];
  const menu = [[Clock3, "Withdraw History"], [Wallet, "Deposit History"], [BarChart3, "Balance History"], [Lock, "Change Password"]] as const;
  const [withdrawMethod, setWithdrawMethod] = useState(methods[0]);
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawNumber, setWithdrawNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const amount = Number(withdrawAmount) || 0;
  const fee = amount * 0.1;
  const receive = Math.max(0, amount - fee);
  const minimumWithdraw = activePlan?.price === "0" ? 200 : 50;
  return (
    <Shell className="bg-slate-50">
      <section className="relative h-80 overflow-visible bg-gradient-to-br from-emerald-700 to-emerald-400 px-8 pt-8 text-white">
        <div className="flex justify-between text-2xl font-black"><span>9:41</span><span>|||</span></div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("dashboard")} className="mt-10 grid h-16 w-16 place-items-center rounded-full bg-emerald-900/20"><ArrowLeft className="h-10 w-10" /></motion.button>
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-center">
          <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border-8 border-white bg-slate-100 text-slate-700 shadow-xl"><User className="h-28 w-28" /><span className="absolute bottom-3 right-0 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-emerald-600"><Pencil className="h-7 w-7 text-white" /></span></div>
        </div>
      </section>
      <section className="px-8 pb-10 pt-32 text-center">
        <h1 className="text-5xl font-black text-slate-800">Ali Raza</h1>
        <div className="mx-auto mt-8 max-w-sm divide-y divide-slate-200 text-2xl text-slate-700">
          <p className="flex items-center justify-center gap-6 pb-5"><span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Phone /></span>+92 312 3456789</p>
          <p className="flex items-center justify-center gap-6 pt-5"><span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Mail /></span>aliraza@example.com</p>
        </div>
        <div className="mt-10 rounded-3xl bg-white p-7 text-left shadow-lg shadow-slate-200">
          <div className="mb-6 flex items-center justify-between"><h2 className="flex items-center gap-4 text-3xl font-black text-slate-800"><span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-700 text-white"><Wallet /></span>Withdraw</h2><ChevronRight className="h-9 w-9" /></div>
          <p className="mb-4 text-slate-500">Available balance: <b className="text-emerald-700">{formatPkr(stats.balance)}</b> · Minimum withdraw {minimumWithdraw} PKR · Fee 10%</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{methods.map((m) => <motion.button whileTap={{ scale: 0.94 }} onClick={() => setWithdrawMethod(m)} key={m} className={`rounded-2xl border p-5 text-center transition ${withdrawMethod === m ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white"}`}><Wallet className="mx-auto h-12 w-12 text-emerald-700" /><p className="mt-3 text-lg text-slate-700">{m}</p></motion.button>)}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="font-bold text-slate-600">Account Name</span><input value={withdrawName} onChange={(event) => setWithdrawName(event.target.value)} placeholder="Enter account holder name" className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
            <label className="block"><span className="font-bold text-slate-600">Account / Phone Number</span><input value={withdrawNumber} onChange={(event) => setWithdrawNumber(event.target.value)} placeholder="03XX XXXXXXX" className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
            <label className="block sm:col-span-2"><span className="flex items-center justify-between font-bold text-slate-600">Withdraw Amount <button type="button" onClick={() => setWithdrawAmount(String(Math.floor(stats.balance)))} className="text-emerald-700">Use available</button></span><input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value.replace(/[^0-9.]/g, ""))} placeholder={`Minimum ${minimumWithdraw} PKR`} className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
          </div>
          <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-slate-700">
            <div className="flex justify-between"><span>Withdraw Amount</span><b>{formatPkr(amount)}</b></div>
            <div className="mt-2 flex justify-between text-red-600"><span>10% Fee Cut</span><b>- {formatPkr(fee)}</b></div>
            <div className="mt-3 flex justify-between border-t border-emerald-100 pt-3 text-xl text-emerald-700"><span>You Receive</span><b>{formatPkr(receive)}</b></div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onWithdraw({ method: withdrawMethod, name: withdrawName, number: withdrawNumber, amount })} className="mt-5 w-full rounded-2xl bg-emerald-700 py-5 text-xl font-black text-white shadow-lg shadow-emerald-200">Submit Withdraw</motion.button>
          <div dir="rtl" className="mt-6 rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 text-right shadow-lg shadow-amber-100">
            <div className="mb-4 flex items-center justify-between gap-3 text-amber-800">
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-amber-500 font-black">i</span>
              <b className="text-2xl">واپسی کی اہم معلومات</b>
            </div>
            <p className="text-xl leading-loose text-amber-950">
              محترم صارف، واپسی کی درخواست جمع ہونے کے بعد ٹیم آپ کی تفصیل چیک کرے گی۔
              واپسی پر 10% سروس فیس لاگو ہوگی اور منظور شدہ رقم آپ کے منتخب کردہ اکاونٹ میں 24 سے 48 گھنٹوں کے اندر بھیجی جائے گی۔
              درست نام، نمبر اور طریقہ کار درج کریں تاکہ درخواست جلد مکمل ہو سکے۔
            </p>
          </div>
        </div>
        <div className="mt-7 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
          {menu.map(([Icon, label]) => <motion.button whileTap={{ scale: 0.98 }} onClick={() => onHistory(label)} key={label} className="flex w-full items-center justify-between border-b border-slate-100 py-6 text-left last:border-0"><span className="flex items-center gap-6 text-2xl text-slate-700"><span className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon /></span>{label}</span><ChevronRight /></motion.button>)}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNavigate("auth")} className="mt-7 flex w-full items-center justify-center gap-4 rounded-2xl bg-white py-6 text-2xl font-bold text-red-600 shadow-lg shadow-slate-200"><LogOut />Logout</motion.button>
      </section>
      <BottomNav active="Profile" onNavigate={onNavigate} />
    </Shell>
  );
}

function Input({ label, icon: Icon, placeholder, eye }: { label: string; icon: typeof User; placeholder: string; eye?: boolean }) {
  return <label className="block"><span className="text-slate-600">{label}</span><span className="mt-2 flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-4 text-slate-400"><Icon className="text-emerald-700" />{placeholder}{eye && <Eye className="ml-auto" />}</span></label>;
}

function Auth({ onAuth }: { onAuth: (provider?: string) => void | Promise<void> }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-start gap-8 p-6 lg:grid-cols-2">
      <AuthPhone type="login" onAuth={onAuth} />
      <AuthPhone type="register" onAuth={onAuth} />
    </div>
  );
}

function AuthPhone({ type, onAuth }: { type: "login" | "register"; onAuth: (provider?: string) => void | Promise<void> }) {
  const isRegister = type === "register";
  const [showGoogle, setShowGoogle] = useState(false);
  const gmailAccounts = [
    { name: "Rohan Patel", email: "rohanpatel@gmail.com", initial: "R" },
    { name: "Ali Raza", email: "aliraza786@gmail.com", initial: "A" },
    { name: "Work Account", email: "earnpro.user@gmail.com", initial: "W" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-2xl shadow-emerald-900/10">
      <section className={`relative overflow-hidden ${isRegister ? "bg-gradient-to-br from-emerald-700 to-emerald-400" : "bg-emerald-50"} px-8 pt-8 text-center ${isRegister ? "text-white" : "text-slate-900"}`}>
        <div className="flex justify-between text-xl font-black"><span>9:41</span><span>|||</span></div>
        {isRegister && <ArrowLeft className="mt-8 h-8 w-8" />}
        <div className="mx-auto mt-12 grid h-28 w-28 place-items-center rounded-full bg-white text-emerald-700"><UserPlus className="h-16 w-16" /></div>
        {!isRegister && <div className="mt-10 h-32 rounded-t-[50%] bg-gradient-to-t from-green-300 to-transparent" />}
        <div className="mt-8 rounded-t-[2rem] bg-white px-6 py-10 text-slate-900">
          <h1 className="text-4xl font-black text-emerald-950">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="mt-3 text-xl text-slate-500">{isRegister ? "Fill in the details to get started" : "Sign in to continue to your account"}</p>
          <div className="mt-10 space-y-5 text-left">
            {isRegister && <Input label="Full Name" icon={User} placeholder="Enter your full name" />}
            <Input label="Email" icon={Mail} placeholder="Enter your email" />
            {isRegister && <Input label="Phone Number" icon={Phone} placeholder="Enter your phone number" />}
            <Input label="Password" icon={Lock} placeholder="Enter your password" eye />
            {isRegister && <Input label="Confirm Password" icon={Lock} placeholder="Confirm your password" eye />}
          </div>
          {!isRegister && <p className="mt-4 text-right font-bold text-emerald-700">Forgot Password?</p>}
          {isRegister && <div className="mt-5 space-y-3 text-slate-500">{["At least 8 characters", "Includes a number", "Includes an uppercase letter"].map((r) => <p key={r} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{r}</p>)}</div>}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onAuth()} className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 py-5 text-2xl font-black text-white shadow-xl shadow-emerald-200">{isRegister ? "Register" : "Login"}</motion.button>
          <div className="my-8 flex items-center gap-4 text-slate-500"><span className="h-px flex-1 bg-slate-200" />Or continue with<span className="h-px flex-1 bg-slate-200" /></div>
          <div className="flex justify-center gap-6"><motion.button whileTap={{ scale: 0.9 }} onClick={() => onAuth("Google")} className="grid h-16 w-20 place-items-center rounded-xl border border-slate-200 text-2xl font-black text-blue-500"><span className="text-red-500">G</span></motion.button><motion.button whileTap={{ scale: 0.9 }} onClick={() => onAuth("Apple")} className="grid h-16 w-20 place-items-center rounded-xl border border-slate-200 text-2xl font-black">A</motion.button><motion.button whileTap={{ scale: 0.9 }} onClick={() => onAuth("Facebook")} className="grid h-16 w-20 place-items-center rounded-xl border border-slate-200 text-2xl font-black text-blue-600">f</motion.button></div>
          <p className="mt-8 text-center text-slate-500">{isRegister ? "Already have an account?" : "Don't have an account?"} <b className="text-emerald-700">{isRegister ? "Login" : "Register"}</b></p>
        </div>
        {showGoogle && <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/40 p-6 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="text-3xl font-black text-blue-600">G</div><span className="font-semibold text-slate-700">Google</span></div><button onClick={() => setShowGoogle(false)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div>
            <h3 className="mt-5 text-2xl font-black text-slate-900">Choose an account</h3>
            <p className="mt-2 text-slate-500">to continue to EarnPro</p>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {gmailAccounts.map((account) => <motion.button whileTap={{ scale: 0.98 }} onClick={() => onAuth(`Google:${account.email}`)} key={account.email} className="flex w-full items-center gap-4 p-4 text-left text-slate-700 first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50"><span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 font-black text-white">{account.initial}</span><span><b className="block text-slate-900">{account.name}</b><span className="text-sm text-slate-500">{account.email}</span></span></motion.button>)}
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => onAuth("Google:another-account@gmail.com")} className="flex w-full items-center gap-4 p-4 text-left text-slate-700 hover:bg-slate-50"><span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 font-black text-slate-500">+</span><span><b className="block text-slate-900">Use another account</b><span className="text-sm text-slate-500">Add a different Gmail</span></span></motion.button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">This is a website demo account chooser. Real device Gmail list needs Google OAuth/Firebase client setup.</p>
          </motion.div>
        </div>}
      </section>
    </motion.div>
  );
}

function Tasks({ onNavigate, activePlan, onClaim, freeClaimed }: { onNavigate: (screen: Screen) => void; activePlan: Plan | null; onClaim: (amount: number) => void; freeClaimed: boolean }) {
  const [watching, setWatching] = useState(false);
  const [done, setDone] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const progress = done ? 100 : adProgress;
  const claimAmount = activePlan ? Number(activePlan.claim.replace(/,/g, "")) : 0;
  const isFreePlan = activePlan?.price === "0";
  const canWatchAd = Boolean(activePlan) && !(isFreePlan && freeClaimed);

  useEffect(() => {
    if (!watching || done) return;
    const timer = window.setInterval(() => {
      setAdProgress((current) => {
        const next = Math.min(100, current + 4);
        if (next >= 100) setDone(true);
        return next;
      });
    }, 220);
    return () => window.clearInterval(timer);
  }, [watching, done]);

  useEffect(() => {
    setWatching(false);
    setDone(false);
    setAdProgress(0);
  }, [activePlan?.name]);

  return (
    <Shell className="bg-[#06182c] text-white">
      <header className="flex items-center justify-between px-7 py-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("dashboard")} className="grid h-16 w-16 place-items-center rounded-full bg-white/10"><ArrowLeft className="h-10 w-10" /></motion.button>
        <h1 className="text-5xl font-black">Daily Tasks</h1>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onNavigate("packages")} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-amber-400 text-amber-900 font-black">$</span><b className="text-2xl">{claimAmount}</b><span className="text-slate-300">PKR</span><Plus className="rounded-full bg-green-600" /></motion.button>
      </header>
      <p className="flex justify-center gap-4 px-8 pb-8 text-2xl text-slate-400"><ClipboardCheck className="text-violet-400" />{activePlan ? isFreePlan ? "FREE plan: daily sirf 1 ad, 16 PKR earning" : `${activePlan.name} active: ad dekh kar ${activePlan.claim} PKR claim karein` : "Package activate karne ke baad ads unlock honge"}</p>
      {!activePlan && <section className="mx-7 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <Lock className="mx-auto h-20 w-20 text-slate-500" />
        <h2 className="mt-5 text-4xl font-black">No Ads Available</h2>
        <p className="mt-4 text-2xl text-slate-400">Pehle Packages page se FREE ya paid package active karein. Package active hote hi yahan ad show hoga.</p>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onNavigate("packages")} className="mt-8 rounded-2xl bg-amber-300 px-10 py-5 text-2xl font-black text-slate-950">Activate Package</motion.button>
      </section>}
      {activePlan && !canWatchAd && <section className="mx-7 rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-300" />
        <h2 className="mt-5 text-4xl font-black">Free Ad Completed</h2>
        <p className="mt-4 text-2xl text-slate-300">Aaj ka FREE plan ad claim ho chuka hai. Kal dobara 1 ad dekh kar 16 PKR earn kar sakte hain.</p>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onNavigate("dashboard")} className="mt-8 rounded-2xl bg-emerald-500 px-10 py-5 text-2xl font-black text-white">Back Home</motion.button>
      </section>}
      {activePlan && canWatchAd && <>
      <section className="mx-7 overflow-hidden rounded-3xl border-4 border-white/10 bg-slate-950">
        <div className="relative min-h-[430px] overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-800 p-8">
          <video className="absolute inset-0 h-full w-full object-cover opacity-75" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" autoPlay muted loop playsInline controls={watching} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-violet-950/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.24),transparent_20%),radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.22),transparent_24%)]" />
          <span className="relative rounded-xl bg-slate-950/50 px-5 py-4 text-2xl font-bold">Sponsored Ad</span>
          <div className="absolute right-8 top-8 rounded-2xl bg-white/15 px-5 py-4 text-xl font-bold text-white backdrop-blur">TechMart</div>
          <div className="relative mt-14 max-w-sm"><p className="text-amber-300">Limited Time Offer</p><h2 className="mt-2 text-5xl font-black">{watching ? "Ad Playing..." : "Smart Deals For Your Phone"}</h2><p className="mt-5 text-2xl text-violet-100">Premium earbuds, chargers and accessories with fast delivery.</p><div className="mt-4 flex items-center gap-2 text-amber-300"><Star className="fill-amber-300" /><Star className="fill-amber-300" /><Star className="fill-amber-300" /><Star className="fill-amber-300" /><span className="text-white">4.8 rating</span></div>{!watching && <motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} onClick={() => setWatching(true)} className="mt-8 flex items-center gap-5 rounded-2xl bg-white px-8 py-5 text-3xl font-black text-violet-700 shadow-xl shadow-violet-950/30">Watch Ad <Play className="rounded-full bg-violet-600 text-white" /></motion.button>}</div>
          {!watching && <motion.div animate={{ rotate: [0, -3, 0], y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-12 right-10 h-76 w-40 rounded-[2.2rem] bg-gradient-to-br from-slate-900 to-violet-950 p-3 shadow-2xl ring-4 ring-white/20"><div className="h-full rounded-[1.7rem] bg-gradient-to-br from-violet-700 via-black to-fuchsia-900"><div className="mx-auto h-6 w-20 rounded-b-2xl bg-black" /><div className="mx-auto mt-12 h-28 w-28 rounded-full bg-violet-400/40 blur-sm" /></div></motion.div>}
        </div>
        <div className="flex items-center gap-5 bg-black/60 px-7 py-6"><Play className="h-10 w-10 fill-white" /><span className="text-2xl">00:02</span><div className="h-2 flex-1 rounded-full bg-slate-600"><div className="h-full w-[38%] rounded-full bg-violet-500" /></div><span className="text-2xl">00:15</span></div>
      </section>
      <section className="mx-7 mt-7 rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="grid grid-cols-[90px_1fr_auto] items-center gap-6"><div className="grid h-24 w-24 place-items-center rounded-full bg-violet-500/20"><Play className="h-12 w-12 text-violet-400" /></div><div><h2 className="text-3xl font-black">{done ? "Ad Completed" : watching ? "Watching Ad..." : "Ready To Watch"}</h2><p className="mt-3 text-2xl text-slate-400">{done ? "Reward unlocked successfully" : watching ? "Please wait while the ad plays" : "Tap Watch Now to start"}</p></div><b className="text-4xl text-violet-400">{progress}%</b></div>
        <div className="ml-32 mt-7 h-5 rounded-full bg-slate-700"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" /></div>
        <p className="ml-32 mt-6 flex items-center gap-3 text-xl text-slate-400"><Clock3 />Estimated time: {done ? "00:00" : watching ? "00:04" : "00:15"}</p>
      </section>
      {done && <motion.section initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mx-12 -mb-8 mt-8 rounded-t-[2rem] border border-white/20 bg-gradient-to-br from-slate-900 to-emerald-950 p-10 text-center shadow-2xl shadow-black/40">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setDone(false); setWatching(false); setAdProgress(0); }} className="float-right grid h-14 w-14 place-items-center rounded-full bg-white/10"><X /></motion.button>
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.7)]"><Check className="h-20 w-20" /></div>
        <h2 className="mt-10 text-5xl font-black">Success!</h2><p className="mt-5 text-3xl text-slate-300">You earned</p><p className="mt-5 text-6xl font-black text-green-400">{claimAmount} PKR</p><motion.button whileTap={{ scale: 0.96 }} onClick={() => { onClaim(claimAmount); setDone(false); setWatching(false); setAdProgress(0); }} className="mt-10 w-full rounded-2xl bg-green-600 py-5 text-3xl font-black">Claim Now</motion.button>
      </motion.section>}
      </>}
    </Shell>
  );
}

function HistoryScreen({ entries, filter, onNavigate }: { entries: HistoryEntry[]; filter: string; onNavigate: (screen: Screen) => void }) {
  const normalized = filter.toLowerCase();
  const shown = normalized.includes("withdraw") ? entries.filter((entry) => entry.type === "withdraw") : normalized.includes("deposit") ? entries.filter((entry) => entry.type === "deposit") : normalized.includes("balance") ? entries.filter((entry) => entry.type === "claim" || entry.type === "referral") : entries;
  return (
    <Shell className="bg-slate-50">
      <header className="flex items-center justify-between bg-gradient-to-br from-emerald-700 to-emerald-500 px-8 py-10 text-white">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("profile")} className="grid h-14 w-14 place-items-center rounded-full bg-white/15"><ArrowLeft /></motion.button>
        <div className="text-center"><h1 className="text-4xl font-black">{filter}</h1><p className="mt-1 text-emerald-50">All account records</p></div>
        <Clock3 className="h-10 w-10" />
      </header>
      <section className="space-y-4 px-7 py-8">
        {shown.length === 0 && <div className="rounded-3xl bg-white p-10 text-center text-xl text-slate-500 shadow-lg shadow-slate-200">No history yet.</div>}
        {shown.map((entry, index) => (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} key={`${entry.title}-${index}`} className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-5"><span className={`grid h-14 w-14 place-items-center rounded-2xl ${entry.type === "withdraw" ? "bg-red-50 text-red-600" : entry.type === "referral" ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-700"}`}>{entry.type === "withdraw" ? <Upload /> : entry.type === "referral" ? <Users /> : <Wallet />}</span><div><h2 className="text-xl font-black text-slate-900">{entry.title}</h2><p className="mt-1 text-slate-500">{entry.detail}</p></div></div>
              <div className="text-right"><b className={entry.type === "withdraw" ? "text-red-600" : "text-emerald-700"}>{entry.type === "withdraw" ? "-" : "+"}{formatPkr(entry.amount)}</b><p className="text-sm text-slate-400">{entry.date}</p></div>
            </div>
          </motion.div>
        ))}
      </section>
    </Shell>
  );
}

function ChangePassword({ onNavigate, onDone }: { onNavigate: (screen: Screen) => void; onDone: (message: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const isValid = current.length > 0 && next.length >= 8 && /[0-9]/.test(next) && next === confirm;

  const submit = () => {
    if (!current) return onDone("Current password enter karein.");
    if (next.length < 8 || !/[0-9]/.test(next)) return onDone("New password 8 characters aur number ke sath hona chahiye.");
    if (next !== confirm) return onDone("Confirm password match nahi kar raha.");
    onDone("Password successfully changed.");
    onNavigate("profile");
  };

  return (
    <Shell className="bg-slate-50">
      <header className="flex items-center justify-between bg-gradient-to-br from-emerald-700 to-emerald-500 px-8 py-10 text-white">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate("profile")} className="grid h-14 w-14 place-items-center rounded-full bg-white/15"><ArrowLeft /></motion.button>
        <div className="text-center"><h1 className="text-4xl font-black">Change Password</h1><p className="mt-1 text-emerald-50">Update your account security</p></div>
        <Lock className="h-10 w-10" />
      </header>
      <section className="px-8 py-10">
        <div className="rounded-3xl bg-white p-7 shadow-lg shadow-slate-200">
          <div className="space-y-5">
            <label className="block"><span className="font-bold text-slate-600">Current Password</span><input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="Enter current password" className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
            <label className="block"><span className="font-bold text-slate-600">New Password</span><input type="password" value={next} onChange={(event) => setNext(event.target.value)} placeholder="At least 8 characters" className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
            <label className="block"><span className="font-bold text-slate-600">Confirm Password</span><input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm new password" className="mt-2 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-emerald-600" /></label>
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-slate-600">
            <p className="flex items-center gap-3"><CheckCircle2 className={next.length >= 8 ? "text-emerald-600" : "text-slate-300"} />At least 8 characters</p>
            <p className="mt-2 flex items-center gap-3"><CheckCircle2 className={/[0-9]/.test(next) ? "text-emerald-600" : "text-slate-300"} />Includes a number</p>
            <p className="mt-2 flex items-center gap-3"><CheckCircle2 className={next === confirm && confirm ? "text-emerald-600" : "text-slate-300"} />Passwords match</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={submit} className={`mt-7 w-full rounded-2xl py-5 text-xl font-black text-white shadow-lg ${isValid ? "bg-emerald-700 shadow-emerald-200" : "bg-slate-400 shadow-slate-200"}`}>Update Password</motion.button>
        </div>
      </section>
    </Shell>
  );
}

function BottomNav({ active, onNavigate }: { active: string; onNavigate: (screen: Screen) => void }) {
  const nav = [[Home, "Dashboard", "dashboard"], [ClipboardCheck, "Tasks", "tasks"], [Users, "Referrals", "referrals"], [User, "Profile", "profile"]] as const;
  return <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-100 bg-white py-4">{nav.map(([Icon, label, target]) => <motion.button whileTap={{ scale: 0.88 }} onClick={() => onNavigate(target)} key={label} className={`flex flex-col items-center gap-2 font-bold ${active === label ? "text-emerald-700" : "text-slate-500"}`}><Icon className="h-8 w-8" /><span>{label}</span></motion.button>)}</nav>;
}

export default function App() {
  const [active, setActive] = useState<Screen>("dashboard");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(packagePlans[0]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [freeClaimed, setFreeClaimed] = useState(false);
  const [stats, setStats] = useState<AccountStats>({ balance: 0, taskBalance: 0, today: 0, referrals: 0, withdrawn: 0, deposit: 0 });
  const [historyFilter, setHistoryFilter] = useState("All History");
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [notice, setNotice] = useState("");
  const navigate = (screen: Screen) => setActive(screen);
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const openPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setActive("packageDetail");
  };
  const activatePlan = (plan: Plan) => {
    const price = Number(plan.price.replace(/,/g, ""));
    if (price > 0 && stats.deposit < price) {
      showNotice("Package sirf deposit balance se buy hoga. Pehle deposit add karein.");
      return;
    }
    if (price > 0) {
      setStats((current) => ({ ...current, deposit: current.deposit - price, balance: current.balance - price }));
      setHistoryEntries((current) => [{ type: "deposit", title: "Package Purchase", amount: price, detail: `${plan.name} package bought from deposit balance`, date: todayLabel() }, ...current]);
    }
    setActivePlan(plan);
    if (plan.price !== "0") setFreeClaimed(false);
    showNotice(`${plan.name} package activated. Daily earning ${plan.claim} PKR unlocked.`);
    setActive("dashboard");
  };
  const startAccount = async (provider?: string) => {
    if (provider === "Google") {
      try {
        const user = await signInWithGoogle();
        showNotice(`${user.email ?? "Gmail"} se account create ho gaya. Sab balance zero hai.`);
      } catch (error) {
        showNotice("Google sign-in cancel ya fail ho gaya. Firebase authorized domain check karein.");
        return;
      }
    }
    setStats({ balance: 0, taskBalance: 0, today: 0, referrals: 0, withdrawn: 0, deposit: 0 });
    setHistoryEntries([]);
    setActivePlan(null);
    setFreeClaimed(false);
    if (provider !== "Google") showNotice("New account ready. Sab balance zero hai. Package activate karein.");
    setActive("dashboard");
  };
  const claimReward = (amount: number) => {
    setStats((current) => ({ ...current, balance: current.balance + amount, taskBalance: current.taskBalance + amount, today: current.today + amount }));
    setHistoryEntries((current) => [{ type: "claim", title: "Daily Task Claim", amount, detail: `${activePlan?.name ?? "Package"} ad reward`, date: todayLabel() }, ...current]);
    if (activePlan?.price === "0") setFreeClaimed(true);
    showNotice(`${amount} PKR claimed successfully.`);
    setActive("dashboard");
  };
  const addDeposit = (amount: number) => {
    setStats((current) => ({ ...current, deposit: current.deposit + amount, balance: current.balance + amount }));
    setHistoryEntries((current) => [{ type: "deposit", title: "Deposit Added", amount, detail: "Manual demo deposit for package purchase", date: todayLabel() }, ...current]);
    showNotice(`${amount} PKR deposit balance mein add ho gaya.`);
  };
  const withdraw = (request: WithdrawRequest) => {
    if (!request.name.trim() || !request.number.trim()) {
      showNotice("Withdraw ke liye account name aur number lazmi hai.");
      return;
    }
    if (!activePlan) {
      showNotice("Withdraw unlock karne ke liye pehle package active karein.");
      setActive("packages");
      return;
    }
    if (request.amount <= 0) {
      showNotice("Withdraw amount enter karein.");
      return;
    }
    const minimum = activePlan?.price === "0" ? 200 : 50;
    if (request.amount < minimum) {
      showNotice(`Minimum withdraw ${minimum} PKR hai.`);
      return;
    }
    if (activePlan.price === "0") {
      showNotice("Withdraw unlock karne ke liye deposit kar ke paid plan buy karein.");
      setActive("packages");
      return;
    }
    if (stats.referrals < request.amount) {
      showNotice("Withdraw unlock karne ke liye referral complete karein. Referral complete hone ke baad withdraw available hoga.");
      setActive("referrals");
      return;
    }
    const fee = request.amount * 0.1;
    const receive = request.amount - fee;
    setStats((current) => ({ ...current, balance: current.balance - request.amount, referrals: current.referrals - request.amount, withdrawn: current.withdrawn + request.amount }));
    setHistoryEntries((current) => [{ type: "withdraw", title: "Withdraw Request", amount: request.amount, detail: `${request.method} to ${request.number}, fee ${fee.toFixed(0)} PKR, receive ${receive.toFixed(0)} PKR`, date: todayLabel() }, ...current]);
    showNotice(`${request.method} withdraw submitted. Fee ${fee.toFixed(0)} PKR, receive ${receive.toFixed(0)} PKR.`);
  };
  const openHistory = (filter: string) => {
    if (filter === "Change Password") {
      setActive("changePassword");
      return;
    }
    setHistoryFilter(filter);
    setActive("history");
  };
  const screen = useMemo(() => ({
    dashboard: <Dashboard onNavigate={navigate} stats={stats} activePlan={activePlan} />,
    packages: <Packages onSelect={openPlan} />,
    packageDetail: <PackageDetail plan={selectedPlan} onBack={() => setActive("packages")} onActivate={activatePlan} activePlan={activePlan} depositBalance={stats.deposit} onDeposit={addDeposit} />,
    referrals: <Referrals stats={stats} activePlan={activePlan} onAction={showNotice} />,
    profile: <Profile onNavigate={navigate} stats={stats} activePlan={activePlan} onWithdraw={withdraw} onHistory={openHistory} />,
    auth: <Auth onAuth={startAccount} />,
    tasks: <Tasks onNavigate={navigate} activePlan={activePlan} onClaim={claimReward} freeClaimed={freeClaimed} />,
    history: <HistoryScreen entries={historyEntries} filter={historyFilter} onNavigate={navigate} />,
    changePassword: <ChangePassword onNavigate={navigate} onDone={showNotice} />,
  })[active], [active, selectedPlan, activePlan, stats, historyEntries, historyFilter, freeClaimed]);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff7e9,transparent_38%),linear-gradient(180deg,#f8fffb,#eef7f2)] text-slate-900">
      <TopTabs active={active} onChange={setActive} />
      {notice && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-emerald-700 px-6 py-3 font-bold text-white shadow-xl shadow-emerald-900/20">{notice}</motion.div>}
      <div className="px-3 py-6">{screen}</div>
    </div>
  );
}

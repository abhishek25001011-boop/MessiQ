import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  TrendingUp,
  Recycle,
  MessageSquare,
  IndianRupee,
  UtensilsCrossed,
  ArrowRight,
  Play,
  Sparkles,
  BarChart3,
  Leaf,
  Zap,
  ShieldCheck,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const features = [
  { icon: Brain, title: "Meal Demand Insights", desc: "Review historical meal selections and a simple average trend. No ML prediction model is connected." },
  { icon: Recycle, title: "Waste Tracking", desc: "Meal selections provide demand context; measured waste needs served and leftover quantities." },
  { icon: IndianRupee, title: "Revenue Tracking", desc: "Revenue analytics require payment or billing records, which are not configured." },
  { icon: MessageSquare, title: "Student Feedback", desc: "Collect meal ratings and comments for review by the mess team." },
  { icon: BarChart3, title: "Firestore Analytics", desc: "Role-scoped dashboards for meal selections, students, menus, and feedback." },
  { icon: ShieldCheck, title: "Role-based Access", desc: "Secure admin controls with granular permissions." },
];

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="max-w-2xl mx-auto text-center mb-14"
    >
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide text-emerald-300/90 bg-emerald-400/10 border border-emerald-400/20">
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold tracking-tight text-white">
        {title}
      </h2>
      {sub && <p className="mt-4 text-white/60 text-base md:text-lg">{sub}</p>}
    </motion.div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(16,185,129,0.35)] overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-400/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
        <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
        <div className="ml-3 text-xs text-white/40">messiq.app — dashboard</div>
      </div>
      <div className="p-5 md:p-7 grid grid-cols-6 gap-4">
        {[
          { label: "Menus", val: "Firestore", tint: "from-emerald-400 to-teal-400" },
          { label: "Meal choices", val: "Role-scoped", tint: "from-sky-400 to-indigo-400" },
          { label: "Analytics", val: "Historical", tint: "from-amber-400 to-orange-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            className="col-span-2 rounded-xl p-4 bg-white/[0.04] border border-white/10"
          >
            <div className="text-[11px] uppercase tracking-wider text-white/50">{s.label}</div>
            <div className={`mt-1 text-2xl font-display font-semibold bg-gradient-to-r ${s.tint} bg-clip-text text-transparent`}>
              {s.val}
            </div>
          </motion.div>
        ))}

        <div className="col-span-6 md:col-span-4 rounded-xl p-4 bg-white/[0.04] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-white/70">Available meal insights</div>
            <div className="text-[11px] text-white/40">After sign-in</div>
          </div>
          <div className="grid h-32 grid-cols-1 content-center gap-3 text-sm text-white/60">
            <p>Demand trends use saved meal selections.</p>
            <p>Students see their own history; admins can review campus selections.</p>
            <p>No real-time demo figures are shown here.</p>
          </div>
        </div>

        <div className="col-span-6 md:col-span-2 rounded-xl p-4 bg-white/[0.04] border border-white/10">
          <div className="text-sm text-white/70 mb-3">Data limits</div>
          <p className="text-xs leading-relaxed text-white/50">Waste quantities and revenue are unavailable until service measurements and billing data are recorded.</p>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white antialiased overflow-x-hidden selection:bg-emerald-400/30">
      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-black" />
            </div>
            <span className="font-display font-semibold tracking-tight">MessIQ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#predictions" className="hover:text-white transition">AI</a>
            <a href="#revenue" className="hover:text-white transition">Revenue</a>
            <a href="#waste" className="hover:text-white transition">Sustainability</a>
            <a href="#feedback" className="hover:text-white transition">Feedback</a>
          </nav>
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white/70 bg-white/5 border border-white/10 backdrop-blur"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Introducing MessIQ · v1.0
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          >
            AI Powered Hostel
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              & Mess Management
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-white/60"
          >
            Coordinate meals. Understand selections. Support mess teams. MessIQ brings clear dining workflows
            to the messiest problem on campus.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <a
              href="#dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/5 backdrop-blur hover:bg-white/10 transition text-white/90"
            >
              <Play className="h-4 w-4" /> Watch Demo
            </a>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            id="dashboard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Everything you need"
            title="A complete mess, in one intelligent layer"
            sub="Modular by design. Beautiful by default. Built for campuses that care about details."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/10 border border-emerald-300/20 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Predictions */}
      <section id="predictions" className="relative py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-sky-300/90 bg-sky-400/10 border border-sky-400/20">
              <Brain className="h-3.5 w-3.5" /> Meal Demand Insights
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold tracking-tight leading-tight">
              Understand demand,
              <br />
              <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
                from recorded choices.
              </span>
            </h2>
            <p className="mt-5 text-white/60 text-lg">
              Review historical meal choices and a simple average demand trend calculated from saved selections. No machine-learning model or prediction pipeline is connected.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[["Real data", "Firestore meal selections"], ["Trend", "Historical average"], ["Model", "Not connected"]].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
                  <div className="mt-1 text-sm font-medium text-white/80">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
              <div className="text-xs text-white/40 mb-4">Meal demand data</div>
              <div className="flex min-h-48 flex-col justify-center gap-4 text-sm text-white/60">
                <p>Historical selection totals and meal-type breakdowns are available after sign-in.</p>
                <p>A trend estimate appears only when enough distinct dates have recorded choices.</p>
                <p>Students see personal records. Campus-wide data is reserved for administrators.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Revenue */}
      <section id="revenue" className="relative py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="order-2 md:order-1">
            <div className="flex min-h-64 flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="mx-auto max-w-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-amber-300">
                  <IndianRupee className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Revenue tracking not configured</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">This project has no payment, billing, or transaction records. Revenue analytics require actual financial data.</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="order-1 md:order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-amber-300/90 bg-amber-400/10 border border-amber-400/20">
              <TrendingUp className="h-3.5 w-3.5" /> Revenue Analytics
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold tracking-tight leading-tight">
              See every rupee.
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Grow every stream.
              </span>
            </h2>
            <p className="mt-5 text-white/60 text-lg">
              Revenue analytics will be available when a secure billing or transaction data source is added.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Waste */}
      <section id="waste" className="relative py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-emerald-300/90 bg-emerald-400/10 border border-emerald-400/20">
              <Leaf className="h-3.5 w-3.5" /> Waste Management
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold tracking-tight leading-tight">
              Less waste.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                More impact.
              </span>
            </h2>
            <p className="mt-5 text-white/60 text-lg">
              Meal selections show intended demand. Actual waste reporting needs recorded meal quantities served and left over; those measurements are not currently available.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="flex min-h-64 items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="mx-auto max-w-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-300">
                  <Recycle className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Waste measurements unavailable</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">Firestore stores meal choices, not prepared, served, consumed, or discarded quantities. No waste totals or reduction percentages are shown.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback */}
      <section id="feedback" className="relative py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Student Feedback"
            title="Voices from the mess hall"
            sub="Meal ratings and comments submitted by students."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Aarav S.", role: "B.Tech, 2nd Yr", quote: "The paneer butter masala on Thursdays is unreal. Feels like the menu was made for me.", rating: 5 },
              { name: "Priya M.", role: "MBA, 1st Yr", quote: "I love how I can pre-select meals. No more wasted plates, no more surprises.", rating: 5 },
              { name: "Rohan K.", role: "B.Sc, 3rd Yr", quote: "Feedback actually gets acted on. The Sunday special changed based on our reviews.", rating: 4 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
              >
                <div className="flex gap-0.5 text-amber-300 text-sm">
                  {"★".repeat(t.rating)}<span className="text-white/20">{"★".repeat(5 - t.rating)}</span>
                </div>
                <p className="mt-4 text-white/80 leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black text-sm font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-indigo-500/10 backdrop-blur-xl p-12 md:p-16"
        >
          <Zap className="h-8 w-8 mx-auto text-emerald-300" />
          <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold tracking-tight">
            Ready to run a smarter mess?
          </h2>
          <p className="mt-4 text-white/60 text-lg">Join the campuses transforming how students eat.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-6 py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-black" />
              </div>
              <span className="font-display font-semibold">MessIQ</span>
            </div>
            <p className="mt-4 text-sm text-white/50 max-w-xs">
              AI-powered hostel & mess management. Designed for campuses that care about details.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Github, Linkedin].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/10 flex items-center justify-center transition">
                  <I className="h-4 w-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-3">Product</div>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#predictions" className="hover:text-white">AI</a></li>
              <li><a href="#revenue" className="hover:text-white">Revenue</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium mb-3">Company</div>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/40">
          <div>© {new Date().getFullYear()} MessIQ. All rights reserved.</div>
          <div>Crafted with care · Made for campuses</div>
        </div>
      </footer>
    </div>
  );
}

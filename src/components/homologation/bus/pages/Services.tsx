
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

const Home = () => {
  const highlights = [
    "CMVR certification support",
    "End-to-end type approval",
    "ICE & Electric Vehicle experience",
    "Testing agency experience across India",
  ];

  const expertise = [
    {
      icon: ClipboardCheck,
      title: "Type Approval",
      description:
        "Support from initial assessment and product data preparation through testing, approval execution and certification grant.",
    },
    {
      icon: FileCheck2,
      title: "Documentation",
      description:
        "Structured management of technical documentation and product information required throughout the certification process.",
    },
    {
      icon: ShieldCheck,
      title: "Regulatory Compliance",
      description:
        "Helping automotive teams navigate applicable government rules, regulations, standards and certification requirements.",
    },
  ];

  return (
    <main className="bg-[#F8F7F4] text-[#1C1C1C]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#111315]">
        {/* Subtle engineering grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#C89B3C]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT */}
            <div>
              <div className="mb-7 inline-flex items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#C89B3C]" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8D4CC]">
                  Automotive Certification Platform
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[4.2rem]">
                Simplifying
                <span className="block text-[#C89B3C]">
                  Automotive Homologation
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#B8B8B4]">
                Auto-Canon is built by passionate automotive professionals to
                make product certification and type approval simpler,
                structured and easier to manage for every member of your
                organization.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-2 bg-[#C89B3C] px-7 py-3.5 text-sm font-semibold text-[#111315] transition hover:bg-[#D7AD54]"
                >
                  Get Started
                  <ArrowRight size={17} />
                </a>

                <a
                  href="/login"
                  className="inline-flex items-center justify-center border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Member Login
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-[#B8B8B4]"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-[#C89B3C]"
                    />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative">
              <div className="border border-white/10 bg-[#1A1D1F] p-3 shadow-2xl">
                <div className="relative overflow-hidden">
                  <img
                    src="https://auto-canon.in/static/media/banner_aboutabout_baner.3cd6d88725b0aed559fe.png"
                    alt="Auto-Canon automotive certification"
                    className="h-[420px] w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/90 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5 border border-white/10 bg-[#111315]/90 p-5 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#C89B3C] text-[#111315]">
                        <Truck size={21} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Automotive Certification
                        </p>

                        <p className="mt-1 text-xs text-[#AFAFA9]">
                          From assessment to certification grant
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative line */}
              <div className="absolute -bottom-5 -right-5 hidden h-20 w-20 border-b border-r border-[#C89B3C]/50 lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRODUCTION
      ========================================================= */}
      <section className="bg-[#F8F7F4]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A77B25]">
              Welcome to Auto-Canon
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
              Making product certification simpler for automotive teams
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#66635D]">
              Our platform is designed to simplify the application and
              certification process according to government rules and
              regulations, making it easier for teams to manage certification
              activities through a structured digital workflow.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          EXPERTISE
      ========================================================= */}
      <section className="border-y border-[#E5E1D8] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A77B25]">
              Our Expertise
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
              Supporting the complete certification journey
            </h2>

            <p className="mt-5 leading-7 text-[#6A6863]">
              Combining automotive experience with a structured digital
              platform to make certification activities easier to manage.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border border-[#E5E1D8] bg-[#E5E1D8] md:grid-cols-3">
            {expertise.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white p-8 transition hover:bg-[#FCFBF8]"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-[#E5E1D8] bg-[#F8F7F4] text-[#A77B25]">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-7 text-xl font-semibold text-[#1B1B1B]">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#6A6863]">
                    {item.description}
                  </p>

                  <div className="mt-6 h-px w-10 bg-[#C89B3C]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          AUTOMOTIVE EXPERIENCE
      ========================================================= */}
      <section className="bg-[#F1EFEA]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A77B25]">
                Automotive Experience
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
                Experience across vehicle categories and technologies
              </h2>

              <p className="mt-6 leading-8 text-[#65635E]">
                Our team has experience with CMVR certification processes for
                both Internal Combustion Engine vehicles and Electric Vehicles,
                covering applications from two-wheelers to commercial
                vehicles.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Internal Combustion Engine",
                  "Electric Vehicles",
                  "Two-wheelers",
                  "Passenger Vehicles",
                  "Commercial Vehicles",
                  "Type Approval",
                ].map((vehicle) => (
                  <div
                    key={vehicle}
                    className="flex items-center gap-3 border border-[#DDD8CE] bg-white px-4 py-3 text-sm font-medium text-[#343330]"
                  >
                    <span className="h-1.5 w-1.5 bg-[#C89B3C]" />
                    {vehicle}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151718] p-8 lg:p-10">
              <Zap size={29} className="text-[#C89B3C]" />

              <h3 className="mt-7 text-2xl font-semibold text-white">
                One platform. A more structured workflow.
              </h3>

              <p className="mt-4 leading-7 text-[#AFAFA9]">
                Manage application information, product data and certification
                activities through a dedicated digital workflow designed for
                automotive organizations.
              </p>

              <a
                href="/get-started"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#C89B3C] transition hover:text-[#D8AF5C]"
              >
                Start with Auto-Canon
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="bg-[#151718]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C89B3C]">
                Auto-Canon Platform
              </p>

              <h2 className="mt-3 text-3xl font-semibold text-white">
                Ready to simplify your certification process?
              </h2>

              <p className="mt-3 max-w-2xl text-[#AFAFA9]">
                Create your account and bring your automotive certification
                workflow into one structured platform.
              </p>
            </div>

            <a
              href="/get-started"
              className="inline-flex shrink-0 items-center gap-2 bg-[#C89B3C] px-7 py-3.5 text-sm font-semibold text-[#151718] transition hover:bg-[#D8AF5C]"
            >
              Get Started
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;


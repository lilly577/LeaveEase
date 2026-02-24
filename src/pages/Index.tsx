import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarCheck2,
  ClipboardCheck,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Smart Leave Tracking",
    description: "Submit, review, and close requests with clear stage visibility from start to finish.",
    icon: ClipboardCheck,
  },
  {
    title: "Priority-Aware Decisions",
    description: "HR teams can quickly focus on urgent requests and keep approvals moving.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Instant Staff Updates",
    description: "Automatic notifications keep everyone informed as statuses change.",
    icon: BellRing,
  },
];

const stats = [
  { label: "Avg. approval time", value: "< 24 hrs" },
  { label: "Request visibility", value: "100%" },
  { label: "Missed updates", value: "Near 0" },
];

const roles = [
  {
    title: "Staff",
    description: "Request leave in minutes, attach supporting docs, and track status without back-and-forth.",
  },
  {
    title: "HR Admin",
    description: "Handle approvals, monitor queues, and maintain policy consistency from one dashboard.",
  },
  {
    title: "Super Admin",
    description: "Manage users, global settings, and governance controls across the entire platform.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[#143b63] text-foreground">
      <header className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-xl border border-white/30 bg-slate-200/95 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#1f4f82] p-2">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-black leading-none tracking-tight text-slate-900">LeaveEase</p>
              <p className="text-[11px] text-slate-600">Leave Management Platform</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a href="#features" className="hover:text-slate-900">Smart Leave Tracking</a>
            <a href="#dashboard" className="hover:text-slate-900">A dashboard your team actually understands</a>
            <a href="#roles" className="hover:text-slate-900">Role-Based Experience</a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-slate-800">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#3da1f2] text-white hover:bg-[#2a8fdf]">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center text-white sm:pb-28 sm:pt-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4 text-[#72c5ff]" />
            Purpose-built for modern HR teams
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Stop chasing leave updates.
            <span className="block">Start running leave with confidence.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-200">
            LeaveEase gives staff, HR, and leadership one shared flow for requests, reviews, and decisions.
          </p>

          <div className="relative mt-14">
            <Card className="overflow-hidden rounded-[28px] border-white/20 bg-slate-100/10 shadow-2xl">
              <CardContent className="p-0">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
                  alt="Coworkers planning schedules together in an office"
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                />
              </CardContent>
            </Card>

            <Card className="absolute -left-1 top-8 w-[230px] border-0 bg-slate-100/95 text-left text-slate-900 shadow-xl sm:-left-8 sm:w-[265px]">
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="h-9 w-9 text-[#1f4f82]" />
                <div>
                  <p className="text-4xl font-black leading-none">{stats[0].value}</p>
                  <p className="mt-2 text-sm text-slate-700">{stats[0].label}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="absolute -right-1 bottom-8 w-[235px] border-0 bg-slate-100/95 text-left text-slate-900 shadow-xl sm:-right-10 sm:w-[290px]">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Role spotlight</p>
                <p className="mt-1 text-2xl font-black">{roles[0].title}</p>
                <p className="mt-1 text-sm text-slate-700">{roles[0].description}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-slate-50 pb-16 pt-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why teams switch</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Built for clarity, not chaos</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group border-border/80 bg-background/85 transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="dashboard" className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_1fr]">
          <Card className="border-primary/20 bg-primary/[0.07]">
            <CardHeader>
              <CardTitle className="text-2xl">A dashboard your team actually understands</CardTitle>
              <CardDescription>Readable statuses, fewer bottlenecks, and no guesswork across departments.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background/80 p-3">
                <p className="text-sm font-medium">Live request status</p>
                <p className="text-sm text-muted-foreground">Everyone sees where requests stand in real time.</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3">
                <p className="text-sm font-medium">Policy-aware reviews</p>
                <p className="text-sm text-muted-foreground">Flagging and consistency checks for HR teams.</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3">
                <p className="text-sm font-medium">Decision history</p>
                <p className="text-sm text-muted-foreground">Clear audit trail for each leave request lifecycle.</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3">
                <p className="text-sm font-medium">Cleaner communication</p>
                <p className="text-sm text-muted-foreground">Fewer emails and fewer follow-up pings.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/80">
            <CardContent className="p-0">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                alt="HR team collaborating over scheduling decisions"
                className="h-full min-h-[300px] w-full object-cover"
              />
            </CardContent>
          </Card>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Role-Based Experience</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Everyone sees what matters to them</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="border-border/80 bg-background/85">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarCheck2 className="h-4 w-4 text-primary" />
                    {role.title}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
          <Card className="border-primary/25 bg-[linear-gradient(120deg,hsl(var(--primary)/0.16),hsl(var(--accent)/0.14))]">
            <CardContent className="flex flex-col items-start justify-between gap-5 px-6 py-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black">Ready to make leave management feel easy?</h2>
                <p className="mt-1 text-muted-foreground">Set up your workspace and start handling requests with less friction.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="lg">
                  <Link to="/register" className="gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background/80">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

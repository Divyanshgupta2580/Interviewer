'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Brain,
  ArrowRight,
  Target,
  MessagesSquare,
  TrendingUp,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { OnboardingTrigger } from '@/components/onboarding-trigger';
import { useOnboardingStore } from '@/stores/onboarding-store';

const steps: {
  icon: FC<{ className?: string }>;
  title: string;
  desc: string;
  examples?: string[];
}[] = [
  {
    icon: Target,
    title: 'Set Your Target & Profile',
    desc: 'Tell us your targeted role and company, then provide the profile materials MSOT needs to personalize your interview.',
    examples: [
      'Your targeted role and company',
      'Your GitHub ID',
      'Your LinkedIn PDF',
      'Your Resume PDF',
    ],
  },
  {
    icon: SlidersHorizontal,
    title: 'Get an Automatic Preparation Plan',
    desc: 'MSOT uses your role and company to automatically build the right preparation plan and quiz for your target interview.',
    examples: [
      'Role-specific interview questions',
      'Company-relevant preparation topics',
      'An automatically personalized quiz',
    ],
  },
  {
    icon: MessagesSquare,
    title: 'Practise Realistic Questions',
    desc: 'Work through an automatically generated quiz aligned with your target role, company, and likely interview expectations.',
    examples: [],
  },
  {
    icon: TrendingUp,
    title: 'Review Feedback and Improve',
    desc: 'Review your performance, identify weak areas, and use targeted practice to improve your interview readiness.',
    examples: [],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand" />
            <span className="text-lg font-semibold tracking-tight">MSOT</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/signin">
              <Button
                variant="outline"
                size="sm"
                className="border-foreground text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="brand" size="sm">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              AI-Powered Interview Preparation
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Your Next Interview Starts Here.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Practise realistic interviews with AI, strengthen your answers,
              and discover what to improve before the real thing.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button variant="brand" size="lg">
                  Start Interview Preparation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-foreground text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
                onClick={() => useOnboardingStore.getState().openManual()}
              >
                Explore How It Works
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Includes 3 free interview sessions. No credit card required.
            </p>
          </div>

          {/* Product Preview */}
          <div className="relative animate-fade-in">
            <div className="rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Mock Interview &middot; Technical
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Live Preview
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Question 3 of 8 &middot; React
                </div>
                <h3 className="text-base font-medium leading-snug">
                  Explain the difference between useMemo and useCallback. When
                  would you use each?
                </h3>
              </div>
              <div className="rounded-md border border-border bg-muted/50 p-4 min-h-[120px]">
                <p className="text-sm text-muted-foreground italic">
                  Type your answer here...
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  22 minutes remaining
                </div>
                <Button variant="brand" size="sm">
                  Submit Answer
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="h-1.5 w-6 rounded-full bg-brand" />
                <span className="h-1.5 w-6 rounded-full bg-brand" />
                <span className="h-1.5 w-6 rounded-full bg-brand" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-10 grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-end md:gap-12">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                A clearer path forward
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                How It Works
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:justify-self-end">
              Four focused steps to turn your target role into a practical interview preparation plan.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative flex h-full min-h-[330px] flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand/15 transition-colors duration-300 group-hover:bg-brand" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <span className="text-3xl font-semibold tracking-tight text-muted-foreground/30">
                      0{i + 1}
                    </span>
                  </div>

                  <div className="mt-7 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      Step {i + 1}
                    </p>
                    <h3 className="text-xl font-semibold leading-tight tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-auto border-t border-border pt-5">
                    {step.examples && step.examples.length > 0 ? (
                      <ul className="space-y-2">
                        {step.examples.map((ex) => (
                          <li
                            key={ex}
                            className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-medium text-muted-foreground">
                        Practice with purpose, then use your feedback to keep improving.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="space-y-4 rounded-lg border border-border bg-card p-8 text-center shadow-sm md:p-12">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to practise?
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Start your first mock interview in minutes. You get 3 free
              sessions to prepare with confidence.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button variant="brand" size="lg">
                  Start Interview Preparation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-foreground text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand" />
            <span className="text-sm font-medium">MSOT</span>
            <span className="text-sm text-muted-foreground">
              &mdash; Interview Preparation Platform
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo Mode &mdash; Sample data for demonstration purposes only.
          </p>
        </div>
      </footer>

      <OnboardingTrigger />
    </div>
  );
}

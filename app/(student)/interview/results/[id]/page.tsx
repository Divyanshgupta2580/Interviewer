'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  LayoutDashboard,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DemoLabel } from '@/components/shared/demo-label';
import { useInterviewStore } from '@/stores/interview-store';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ResultsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { getSession, isHydrated } = useInterviewStore();
  const [showAnswers, setShowAnswers] = useState(false);

  const session = getSession(id);

  useEffect(() => {
    if (isHydrated && !session) {
      router.push('/interview/history');
    }
  }, [isHydrated, session, router]);

  if (!isHydrated) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  if (!session || !session.feedback) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Results not available.</p>
        <Button variant="outline" onClick={() => router.push('/interview/history')}>
          View History
        </Button>
      </div>
    );
  }

  const feedback = session.feedback;

  const radarData = feedback.questionFeedback.map((qf) => {
    const question = session.questions.find((q) => q.id === qf.questionId);
    return {
      topic: question?.topic || 'N/A',
      score: qf.score,
    };
  });

  const barData = feedback.questionFeedback.map((qf) => {
    const question = session.questions.find((q) => q.id === qf.questionId);
    return {
      name: `Q${session.questions.findIndex((q) => q.id === qf.questionId) + 1}`,
      Technical: qf.technicalCorrectness,
      Clarity: qf.answerClarity,
      Communication: qf.communicationQuality,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h1 className="text-2xl font-semibold">Interview Complete</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.config.targetRole} &middot; {session.config.type.replace('_', ' ')} &middot;{' '}
            {session.completedAt && format(new Date(session.completedAt), 'MMM d, yyyy')}
          </p>
        </div>
        <DemoLabel />
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-32 w-32 -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--brand))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(feedback.overallScore / 100) * 351.7} 351.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-3xl font-semibold">{feedback.overallScore}</span>
              </div>
              <span className="mt-2 text-xs text-muted-foreground uppercase tracking-wide">Overall Score</span>
            </div>
            <div className="flex-1 md:ml-8">
              <div className="text-xs font-medium text-brand uppercase tracking-wide mb-2">
                Demonstration Feedback — Not a live AI evaluation
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{feedback.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Performance</CardTitle>
            <CardDescription>Score by interview topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="score" stroke="hsl(var(--brand))" fill="hsl(var(--brand))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluation Breakdown</CardTitle>
            <CardDescription>Per-question scores by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Technical" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Clarity" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Communication" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weak Areas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <CardTitle className="text-base">Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {feedback.strongestTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="bg-success/10 text-success">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              <CardTitle className="text-base">Areas to Improve</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {feedback.weakAreas.map((topic) => (
                <Badge key={topic} variant="secondary" className="bg-brand/10 text-brand">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Practice */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Recommended Practice Topics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {feedback.recommendedPracticeTopics.map((topic) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Feedback */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Question-by-Question Feedback</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswers(!showAnswers)}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {showAnswers ? 'Hide Answers' : 'Review Answers'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.questionFeedback.map((qf, i) => {
            const question = session.questions.find((q) => q.id === qf.questionId);
            const answer = session.answers.find((a) => a.questionId === qf.questionId);
            return (
              <div key={qf.questionId} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                      {question && <Badge variant="outline" className="text-xs">{question.topic}</Badge>}
                    </div>
                    <p className="text-sm font-medium">{question?.questionText}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-lg font-semibold ${qf.score >= 70 ? 'text-success' : qf.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                      {qf.score}
                    </span>
                    <span className="text-xs text-muted-foreground">score</span>
                  </div>
                </div>

                {showAnswers && (
                  <div className="space-y-1 rounded-md bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground">Your Answer</div>
                    <p className="text-sm text-muted-foreground">
                      {answer?.answerText || 'No answer submitted'}
                    </p>
                  </div>
                )}

                <div className="grid gap-2 text-xs sm:grid-cols-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Technical:</span>
                    <span className="font-medium">{qf.technicalCorrectness}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Clarity:</span>
                    <span className="font-medium">{qf.answerClarity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Communication:</span>
                    <span className="font-medium">{qf.communicationQuality}</span>
                  </div>
                </div>

                {qf.strengths.length > 0 && (
                  <div className="text-xs">
                    <span className="text-success font-medium">Strengths: </span>
                    <span className="text-muted-foreground">{qf.strengths.join(', ')}</span>
                  </div>
                )}
                {qf.weaknesses.length > 0 && (
                  <div className="text-xs">
                    <span className="text-brand font-medium">Weaknesses: </span>
                    <span className="text-muted-foreground">{qf.weaknesses.join(', ')}</span>
                  </div>
                )}
                {qf.missingConcepts.length > 0 && (
                  <div className="text-xs">
                    <span className="text-destructive font-medium">Missing: </span>
                    <span className="text-muted-foreground">{qf.missingConcepts.join(', ')}</span>
                  </div>
                )}
                {qf.suggestedImprovements.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground font-medium">Suggested: </span>
                    <span className="text-muted-foreground">{qf.suggestedImprovements.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Link href="/dashboard">
          <Button variant="ghost">
            <LayoutDashboard className="mr-1.5 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href="/interview/history">
            <Button variant="outline">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              View History
            </Button>
          </Link>
          <Link href="/interview/configure">
            <Button variant="brand">
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Try Another Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

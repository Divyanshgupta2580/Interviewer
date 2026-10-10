'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DemoLabel } from '@/components/shared/demo-label';
import { useInterviewStore } from '@/stores/interview-store';
import { toast } from 'sonner';

export default function ActiveInterviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const {
    getSession,
    startSession,
    submitAnswer,
    completeSession,
    abandonSession,
    isHydrated,
  } = useInterviewStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const session = getSession(id);

  useEffect(() => {
    if (isHydrated && session && session.status === 'configured') {
      startSession(id);
    }
  }, [isHydrated, session, id, startSession]);

  const currentQuestion = session?.questions[currentIdx];
  const answers = session?.answers || [];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  useEffect(() => {
    if (currentAnswer) {
      setAnswerText(currentAnswer.answerText);
    } else {
      setAnswerText('');
    }
  }, [currentIdx, currentAnswer]);

  if (!isHydrated) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Interview session not found.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  useEffect(() => {
    if (session && session.status === 'completed') {
      router.push(`/interview/results/${id}`);
    }
  }, [session, router, id]);

  if (session && session.status === 'completed') {
    return null;
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">No questions available.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (!answerText.trim()) {
      toast.error('Please write an answer before submitting');
      return;
    }
    submitAnswer(id, currentQuestion.id, answerText);
    toast.success('Answer submitted');

    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // All questions answered, complete the interview
      completeSession(id);
      toast.success('Interview completed! Viewing results...');
      router.push(`/interview/results/${id}`);
    }
  };

  const handleFinishNow = () => {
    if (answerText.trim()) {
      submitAnswer(id, currentQuestion.id, answerText);
    }
    completeSession(id);
    toast.success('Interview completed');
    router.push(`/interview/results/${id}`);
  };

  const handleEndInterview = () => {
    abandonSession(id);
    toast.info('Interview abandoned');
    router.push('/dashboard');
  };

  const answeredCount = answers.length;
  const totalQuestions = session.questions.length;
  const progressPercent = ((currentIdx + 1) / totalQuestions) * 100;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <Brain className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Mock Interview</h1>
            <p className="text-xs text-muted-foreground">
              {session.config.targetRole} &middot; {session.config.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <DemoLabel />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <span className="text-muted-foreground">
            {answeredCount} answered
          </span>
        </div>
        <div className="flex gap-1">
          {session.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < currentIdx
                  ? 'bg-brand'
                  : i === currentIdx
                  ? 'bg-brand/50'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Topic Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.topic}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {session.config.durationMinutes} min total
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-brand uppercase tracking-wide">
              Sample Question — Demonstration
            </div>
            <h2 className="text-xl font-medium leading-snug">
              {currentQuestion.questionText}
            </h2>
            {currentQuestion.expectedConcepts && currentQuestion.expectedConcepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentQuestion.expectedConcepts.map((concept) => (
                  <Badge key={concept} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Answer</label>
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {answerText.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentIdx > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Previous
                </Button>
              )}
              <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-destructive">
                    <X className="mr-1.5 h-4 w-4" />
                    End Interview
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End this interview?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You have answered {answeredCount} of {totalQuestions} questions.
                      Unanswered questions will be marked as incomplete.
                      You can finish now and see your results, or abandon the interview.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndInterview} className="text-destructive">
                      Abandon
                    </AlertDialogAction>
                    <AlertDialogAction onClick={handleFinishNow}>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Finish & See Results
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button variant="brand" onClick={handleSubmitAnswer}>
              {currentIdx < session.questions.length - 1 ? (
                <>
                  Submit & Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Submit & Finish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

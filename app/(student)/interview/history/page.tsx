'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  History,
  Clock,
  Award,
  ArrowRight,
  Brain,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInterviewStore } from '@/stores/interview-store';
import type { InterviewType, SessionStatus } from '@/types';
import { format } from 'date-fns';

export default function InterviewHistoryPage() {
  const { sessions, isHydrated } = useInterviewStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSessions = sessions
    .filter((s) => s.status === 'completed' || s.status === 'abandoned')
    .filter((s) => typeFilter === 'all' || s.config.type === typeFilter)
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => (b.completedAt || b.createdAt).localeCompare(a.completedAt || a.createdAt));

  if (!isHydrated) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Interview History"
        description="Review your past interview attempts and results."
      />

      {/* Filters */}
      {filteredSessions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter:
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="system_design">System Design</SelectItem>
              <SelectItem value="role_specific">Role-Specific</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<History className="h-6 w-6 text-muted-foreground" />}
              title="No interviews yet"
              description="Your completed and abandoned interviews will appear here. Start your first mock interview to get started."
              action={
                <Link href="/interview/configure">
                  <Button variant="brand">
                    <Brain className="mr-1.5 h-4 w-4" />
                    Start Interview
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{session.config.targetRole}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.config.type.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        session.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : 'text-muted-foreground'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(session.completedAt || session.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span>{session.config.difficulty}</span>
                    <span>{session.config.durationMinutes} min</span>
                    {session.feedback && (
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Score: {session.feedback.overallScore}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {session.config.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {session.config.topics.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{session.config.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {session.status === 'completed' ? (
                    <Link href={`/interview/results/${session.id}`}>
                      <Button variant="outline" size="sm">
                        Review
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/interview/configure">
                      <Button variant="ghost" size="sm">
                        Retry
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

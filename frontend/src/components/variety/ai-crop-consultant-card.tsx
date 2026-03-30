'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, Send, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

interface AICropConsultantCardProps {
  title: string;
  subtitle: string;
  chatPlaceholder: string;
  sampleQuestion1: string;
  sampleQuestion2: string;
  sampleResponse: string;
  className?: string;
}

export function AICropConsultantCard({
  title,
  subtitle,
  chatPlaceholder,
  sampleQuestion1,
  sampleQuestion2,
  sampleResponse,
  className,
}: AICropConsultantCardProps) {
  const [messages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      text: sampleResponse,
      isUser: false,
    },
  ]);

  return (
    <Card className={cn('bg-muted/30 flex h-full flex-col', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-foreground text-base">{title}</CardTitle>
            <p className="text-foreground dark:text-foreground/80 mt-0.5 text-xs">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        {/* Chat Messages Area */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {/* Sample Questions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-foreground dark:text-foreground h-auto w-full justify-start px-3 py-2 text-left text-xs"
              disabled
            >
              <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
              {sampleQuestion1}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground dark:text-foreground h-auto w-full justify-start px-3 py-2 text-left text-xs"
              disabled
            >
              <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
              {sampleQuestion2}
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 pt-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.isUser ? 'justify-end' : 'justify-start',
                )}
              >
                {!message.isUser && (
                  <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground dark:bg-muted/50 dark:text-foreground',
                  )}
                >
                  {message.text}
                </div>
                {message.isUser && (
                  <div className="bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <MessageSquare className="text-foreground dark:text-foreground/70 h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-border flex flex-shrink-0 gap-2 border-t pt-2">
          <Input
            type="text"
            placeholder={chatPlaceholder}
            className="text-foreground flex-1"
            disabled
          />
          <Button size="icon" variant="default" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

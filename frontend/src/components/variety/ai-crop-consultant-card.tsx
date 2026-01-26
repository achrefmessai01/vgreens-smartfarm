'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bot, Send, MessageSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
}

interface AICropConsultantCardProps {
  title: string
  subtitle: string
  chatPlaceholder: string
  sampleQuestion1: string
  sampleQuestion2: string
  sampleResponse: string
  className?: string
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
  ])

  return (
    <Card className={cn('bg-muted/30 flex flex-col h-full', className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-foreground">{title}</CardTitle>
            <p className="text-xs text-foreground dark:text-foreground/80 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 space-y-4">
        {/* Chat Messages Area */}
        <div className="flex-1 space-y-3 min-h-0 overflow-y-auto pr-2">
          {/* Sample Questions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 px-3 text-xs text-foreground dark:text-foreground"
              disabled
            >
              <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
              {sampleQuestion1}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 px-3 text-xs text-foreground dark:text-foreground"
              disabled
            >
              <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
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
                  message.isUser ? 'justify-end' : 'justify-start'
                )}
              >
                {!message.isUser && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm max-w-[80%]',
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground dark:bg-muted/50 dark:text-foreground'
                  )}
                >
                  {message.text}
                </div>
                {message.isUser && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-3 w-3 text-foreground dark:text-foreground/70" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex gap-2 pt-2 border-t border-border flex-shrink-0">
          <Input
            type="text"
            placeholder={chatPlaceholder}
            className="flex-1 text-foreground"
            disabled
          />
          <Button size="icon" variant="default" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

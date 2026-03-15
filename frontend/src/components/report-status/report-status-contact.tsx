'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export function ReportStatusContact() {
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          {t.pages.reportStatus.contact.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {t.pages.reportStatus.contact.description}
        </p>
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin/reports">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t.pages.reportStatus.contact.submitAnother}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
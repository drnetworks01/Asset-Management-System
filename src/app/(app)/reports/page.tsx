import Link from 'next/link';
import { ImportWizard } from '@/components/import/ImportWizard';
import { AiSearchPanel } from '@/components/ai/AiSearchPanel';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Reports & Imports</h1>
        <p className="text-sm text-muted-foreground">
          Generate exports, print labels, or sync with a new Excel file.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <ReportCard
          title="Full Inventory (Excel)"
          description="One sheet with every item, condition, and notes."
          href="/api/export/excel"
          download
        />
        <ReportCard
          title="By Location (Excel)"
          description="Separate sheet per location."
          href="/api/export/excel?group=location"
          download
        />
        <ReportCard
          title="QR Label Sheet"
          description="Printable A4 sheet of QR codes for every item."
          href="/qr"
        />
        <ReportCard
          title="Printable Inventory PDF"
          description="A4-ready full inventory grouped by location. Print → Save as PDF."
          href="/reports/print"
        />
        <ReportCard
          title="Database Backup"
          description="Download the entire SQLite database file (admin only)."
          href="/api/backup"
          download
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">AI Search</h2>
        <AiSearchPanel />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Re-import from Excel</h2>
        <ImportWizard />
      </section>
    </div>
  );
}

function ReportCard({
  title,
  description,
  href,
  download,
}: {
  title: string;
  description: string;
  href: string;
  download?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-4">
        <Link href={href} {...(download ? { download: '' } : {})}>
          Open
        </Link>
      </Button>
    </div>
  );
}

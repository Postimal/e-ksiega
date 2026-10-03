import { Component, signal } from '@angular/core';
import type { Content, TDocumentDefinitions, TVirtualFileSystem } from 'pdfmake/interfaces';
import { GuestbookEntryRecord, GuestbookService } from '../../../firebase/guestbook.service';
import { UrlQueryParamService } from '../../../services/url-query-params.service';

@Component({
  selector: 'app-print-view',
  templateUrl: './print-view.html',
  styleUrls: ['./print-view.scss'],
})
export class PrintViewComponent {
  protected readonly photos = signal<GuestbookEntryRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isGeneratingPdf = signal(false);
  protected readonly loadError = signal('');
  protected readonly errorMessage = signal('');

  constructor(
    private readonly guestbookService: GuestbookService,
    private readonly urlQueryParamService: UrlQueryParamService,
  ) {
    void this.loadPhotos();
  }

  private async loadPhotos(): Promise<void> {
    try {
      this.photos.set(
        await this.guestbookService.getEntriesV1(this.urlQueryParamService.groupIdParam() ?? ''),
      );
    } catch {
      this.loadError.set('Nie udało się pobrać wpisów. Spróbuj ponownie później.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async downloadPdf(): Promise<void> {
    this.isGeneratingPdf.set(true);
    this.errorMessage.set('');

    try {
      const [pdfMakeModule, fontModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);
      const pdfMake =
        (pdfMakeModule as unknown as { default?: typeof pdfMakeModule }).default ?? pdfMakeModule;
      const pdfFonts =
        (fontModule as { default?: TVirtualFileSystem }).default ??
        (fontModule as unknown as TVirtualFileSystem);

      pdfMake.addVirtualFileSystem(pdfFonts);
      const content: Content[] = [
        { text: 'Księga Pamiątkowa', style: 'title', margin: [0, 0, 0, 6] },
        {
          text: 'Chrzest Święty i pierwsze urodziny',
          style: 'subtitle',
          margin: [0, 0, 0, 24],
        },
      ];

      if (this.photos().length === 0) {
        content.push({ text: 'Brak wpisów do wyświetlenia.', style: 'emptyState' });
      }

      for (const entry of this.photos()) {
        const cardContent: Content[] = [];

        if (entry.photoUrl) {
          cardContent.push({
            image: await this.loadImageAsDataUrl(entry.photoUrl),
            fit: [480, 350],
            alignment: 'center',
            margin: [0, 0, 0, 16],
          });
        }

        if (entry.wishes.trim()) {
          cardContent.push({ text: entry.wishes, style: 'wishText' });
        }

        if (entry.signature.trim()) {
          cardContent.push({
            text: `— ${entry.signature}`,
            style: 'signature',
            margin: [0, 12, 0, 0],
          });
        }

        if (cardContent.length) {
          content.push({
            table: {
              widths: ['*'],
              body: [[{ stack: cardContent, margin: [12, 12, 12, 12] }]],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#e2e8f0',
              vLineColor: () => '#e2e8f0',
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0,
            },
            unbreakable: true,
            margin: [0, 0, 0, 18],
          });
        }
      }

      const documentDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [42, 42, 42, 42],
        defaultStyle: { font: 'Roboto', color: '#334155' },
        content,
        styles: {
          title: { fontSize: 24, bold: true, alignment: 'center', color: '#1e293b' },
          subtitle: { fontSize: 12, alignment: 'center', color: '#64748b' },
          wishText: { fontSize: 15, italics: true, lineHeight: 1.3 },
          signature: { fontSize: 13, bold: true, alignment: 'right', color: '#1e293b' },
          emptyState: { fontSize: 14, alignment: 'center', color: '#64748b' },
        },
      };

      pdfMake.createPdf(documentDefinition).download('ksiega-pamiatkowa.pdf');
    } catch {
      this.errorMessage.set('Nie udało się utworzyć PDF. Sprawdź połączenie i spróbuj ponownie.');
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }

  private async loadImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Image download failed');
    }

    const imageBlob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Image conversion failed'));
      reader.onerror = () => reject(new Error('Image conversion failed'));
      reader.readAsDataURL(imageBlob);
    });
  }
}

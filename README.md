# Factureo

### Your brand. Your documents. Ready in minutes.

**Beautiful invoices and quotes, made yours.** Factureo brings custom logos, flexible layouts, brand colors, and French/English support into a simple workspace. Preview your document live, fine-tune the details, and download a polished PDF — with no account and no saved documents.

**Vos devis et factures, à votre image.** Personnalisez votre logo, vos couleurs et votre mise en page. Créez vos documents en français ou en anglais et téléchargez votre PDF, sans compte ni conservation de vos documents.

Factureo is a privacy-first web app for generating professional **devis** and **factures** with custom branding, live A4 preview, and PDF download.

The product is intentionally simple: users create the document, customize it, download it, and leave. The app does **not** store invoices, clients, logos, or user data.

## Core Concept

- No account required.
- No backend required.
- No database.
- No `localStorage` or saved invoice history.
- Uploaded logos and form data only exist in the active browser tab.
- A privacy popup appears when the app opens to explain this clearly.

## Features

- Generate either a facture or a devis.
- Custom logo upload with editable size and position.
- Professional A4 live preview.
- PDF export with readable print typography.
- Browser print support.
- French and English document labels.
- Complete French/English interface, including the privacy popup, form labels, buttons, and export messages. Use FR/EN in the header or welcome popup. French is the default. Switching language preserves entered text and logos; custom notes and descriptions are not automatically translated. The language preference is not stored.
- Custom document title, number, issue date, due date, and validity date.
- Company and client details.
- ICE, IF, RC, patente, and RIB/bank fields.
- Dynamic product/service lines.
- Automatic subtotal, discount, tax, total, paid amount, and balance calculations.
- MAD, EUR, USD, GBP, and CAD currencies.
- Three document templates: Modern, Classic, and Minimal.
- Six brand accent colors.
- Toggles for optional sections: tax, discount, paid amount, bank details, legal IDs, and signature.
- Custom footer and signature label.
- Exported documents contain no Factureo branding or privacy message. The optional footer is blank by default and appears only when you enter your own text.
- Responsive editor and preview layout.
- Light/dark interface toggle, initially matching your system preference. Theme stays only in memory; PDFs remain white.
- Larger document typography (14–15px body text, approximately 10.5–11pt on A4).
- PDF generation uses an isolated preview clone so the editor does not resize while exporting. Download success/error messages provide feedback, and Print offers a Save as PDF fallback.

## Download troubleshooting

PDF exports use compact fixed spacing and no minimum paper height. Small overflows fit onto one A4 sheet with at most an 8% reduction; longer documents retain normal text size and use additional pages. The default invoice and devis were checked by inspecting the generated PDF page count: one page each.

Use Download PDF and check the browser's downloads list. Allow downloads if your browser blocks them. If an export fails, an error message appears and you can use Print → Save as PDF. Generation is local; no invoice content is sent to a server. Long PDFs are rasterized and split across A4 pages; text is not selectable and very long content can cross a page boundary.

## Tech Stack

- React 19
- TypeScript
- Vite
- jsPDF and html2canvas for PDF generation
- Lucide React icons
- Custom responsive CSS

## Installation

Prerequisites: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Vite will print the local URL, usually:

```bash
http://localhost:5173
```

## Commands

```bash
npm run dev      # local development server
npm run build    # TypeScript check and production build
npm run preview  # local preview of the production build
```

## Usage

1. Choose `Facture` or `Devis`.
2. Add company and client information.
3. Upload a logo if needed.
4. Add products or services.
5. Customize branding, template, language, and visible sections.
6. Check the A4 preview.
7. Download the PDF or print.

Nothing is saved after the page is closed or reset.

## Project Structure

```text
src/
  App.tsx       Main generator UI, calculations, preview, and PDF export
  data.ts       Default document data and FR/EN labels
  main.tsx      React entry point
  styles.css    UI, document preview, modal, responsive, and print styles
  types.ts      TypeScript document types
```

## Production Notes

The app processes document contents in browser memory. No document database, analytics integration, or account system is included. Hosting providers may retain ordinary request logs, and Google Fonts is currently loaded externally. Downloaded files are saved by the user's browser at their request.

## Deployment

Source: [soufianfallah/Factureo](https://github.com/soufianfallah/Factureo).

Import this repository into Vercel using the Vite preset. The included `vercel.json` sets `npm run build` and the `dist` output directory. No environment variables or backend services are required. Use a supported Node.js version (22 recommended). When Git integration is connected, pushes to `main` deploy to production.

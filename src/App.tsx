import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  ImagePlus,
  LoaderCircle,
  Moon,
  Sun,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { translator } from './i18n'
import { createDefaultDocument, dictionary } from './data'
import type { DocumentKind, InvoiceData, LineItem, LogoPosition, TemplateStyle } from './types'

const currencies: Record<string, { locale: string; label: string }> = {
  MAD: { locale: 'fr-MA', label: 'MAD - Dirham marocain' },
  EUR: { locale: 'fr-FR', label: 'EUR - Euro' },
  USD: { locale: 'en-US', label: 'USD - US Dollar' },
  GBP: { locale: 'en-GB', label: 'GBP - Pound Sterling' },
  CAD: { locale: 'en-CA', label: 'CAD - Canadian Dollar' },
}

const brandColors = ['#2563eb', '#0f766e', '#7c3aed', '#be123c', '#c2410c', '#111827']
const templates: Array<{ id: TemplateStyle; label: string }> = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
]

const logoPositions: Array<{ id: LogoPosition; label: string }> = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
]

const formatDate = (date: string, language: 'fr' | 'en') => {
  if (!date) return '-'
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

const calculate = (document: InvoiceData) => {
  const subtotal = document.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
  const discount = document.options.showDiscount ? Number(document.discount || 0) : 0
  const discounted = Math.max(0, subtotal - discount)
  const tax = document.options.showTax ? discounted * (Number(document.taxRate || 0) / 100) : 0
  const total = discounted + tax
  const paid = document.kind === 'invoice' && document.options.showPaidAmount ? Number(document.paidAmount || 0) : 0
  return { subtotal, discount, tax, total, balance: Math.max(0, total - paid) }
}

function App() {
  const [document, setDocument] = useState<InvoiceData>(createDefaultDocument)
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'options'>('content')
  const [showPrivacyModal, setShowPrivacyModal] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [exportMessage, setExportMessage] = useState('')
  const [exportError, setExportError] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tr = translator(document.language)
  useEffect(() => { window.document.documentElement.lang = document.language }, [document.language])
  const totals = useMemo(() => calculate(document), [document])

  const update = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setDocument(current => ({ ...current, [key]: value }))
  }

  const updateOption = (key: keyof InvoiceData['options'], value: boolean) => {
    setDocument(current => ({ ...current, options: { ...current.options, [key]: value } }))
  }

  const updateItem = (id: string, key: keyof LineItem, value: string | number) => {
    update('items', document.items.map(item => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const money = (value: number) => new Intl.NumberFormat(currencies[document.currency]?.locale ?? 'fr-MA', {
    style: 'currency',
    currency: document.currency,
    minimumFractionDigits: 2,
  }).format(value)

  const setKind = (kind: DocumentKind) => {
    const prefix = kind === 'quote' ? 'DEV' : 'FAC'
    const nextTitle = kind === 'quote' ? '' : ''
    setDocument(current => ({
      ...current,
      kind,
      documentTitle: nextTitle,
      documentNumber: `${prefix}-${new Date().getFullYear()}-001`,
      paidAmount: kind === 'quote' ? 0 : current.paidAmount,
    }))
  }

  const uploadLogo = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 3_000_000) {
      window.alert(tr("Choose an image under 3 MB."))
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('logo', String(reader.result))
    reader.readAsDataURL(file)
  }

  const addItem = () => {
    update('items', [...document.items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }])
  }

  const removeItem = (id: string) => {
    if (document.items.length > 1) {
      update('items', document.items.filter(item => item.id !== id))
    }
  }

  const resetDocument = () => {
    if (window.confirm(tr("Reset the current document? Nothing has been stored."))) {
      setDocument({ ...createDefaultDocument(), language: document.language })
      setActiveTab('content')
    }
  }

  const exportPdf = async () => {
    if (!previewRef.current || exporting) return
    setExporting(true)
    setExportMessage('')
    setExportError(false)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
      const element = previewRef.current
      await window.document.fonts.ready
      const canvas = await html2canvas(element, {
        scale: 2.4,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 1200,
        onclone: (_clonedDocument, clonedElement) => {
          clonedElement.classList.add('pdf-export-mode')
          clonedElement.style.setProperty('--accent', document.accentColor)
        },
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      // Fit small overflows onto one sheet (at most 8% smaller). Longer
      // documents keep their normal text size and continue onto more pages.
      const naturalHeightMm = (canvas.height * 210) / canvas.width
      const fitScale = naturalHeightMm <= 277 / 0.92 ? Math.min(1, 277 / naturalHeightMm) : 1
      const imageWidthMm = 210 * fitScale
      const pageHeightPx = Math.floor((canvas.width * 277) / imageWidthMm + 0.001)
      let offset = 0
      let page = 0
      while (offset < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - offset)
        const slice = window.document.createElement('canvas')
        slice.width = canvas.width
        slice.height = sliceHeight
        slice.getContext('2d')?.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
        if (page > 0) pdf.addPage()
        pdf.addImage(slice.toDataURL('image/jpeg', 0.97), 'JPEG', (210 - imageWidthMm) / 2, 10, imageWidthMm, (sliceHeight * imageWidthMm) / canvas.width)
        offset += sliceHeight
        page += 1
      }
      const filename = (document.documentNumber.trim() || document.kind).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      const url = URL.createObjectURL(pdf.output('blob'))
      const link = window.document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setExportMessage('success')
    } catch (error) {
      console.error('PDF export failed', error)
      setExportError(true)
      setExportMessage('failure')
    } finally {
      previewRef.current?.classList.remove('pdf-export-mode')
      setExporting(false)
    }
  }

  return (
    <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'} style={{ '--accent': document.accentColor } as React.CSSProperties}>
      {showPrivacyModal ? <PrivacyModal language={document.language} onLanguageChange={language => update('language', language)} onClose={() => setShowPrivacyModal(false)} /> : null}

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><FileText size={20} /></span>
          <span>Factureo</span>
        </div>
        <div className="document-kind" aria-label={tr("Document type")}>
          <button className={document.kind === 'invoice' ? 'active' : ''} onClick={() => setKind('invoice')}>{document.language === 'fr' ? 'Facture' : 'Invoice'}</button>
          <button className={document.kind === 'quote' ? 'active' : ''} onClick={() => setKind('quote')}>{document.language === 'fr' ? 'Devis' : 'Quote'}</button>
        </div>
        <div className="top-actions">
          <LanguageSwitch language={document.language} onChange={language => update('language', language)} />
          <button type="button" className="button secondary theme-toggle" aria-label={darkMode ? tr("Switch to light mode") : tr("Switch to dark mode")} aria-pressed={darkMode} onClick={() => setDarkMode(current => !current)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="button secondary hide-mobile" onClick={resetDocument}><RefreshCw size={17} /> {tr("Reset")}</button>
          <button className="button secondary hide-mobile" onClick={() => window.print()}><Printer size={17} /> {tr("Print")}</button>
          <button type="button" className="button primary" onClick={exportPdf} disabled={exporting}>
            {exporting ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />}
            {exporting ? tr("Generating...") : tr("Download PDF")}
          </button>
        </div>
      </header>
      {exportMessage ? <div className={`export-message${exportError ? ' error' : ''}`} role={exportError ? 'alert' : 'status'}>{tr(exportError ? 'PDF could not be generated. Please try again, or use Print and choose Save as PDF.' : 'PDF generated. Check your downloads. Your document is not stored by Factureo.')}<button type="button" aria-label={tr("Dismiss message")} onClick={() => setExportMessage('')}><X size={18} /></button></div> : null}

      <main className="workspace">
        <section className="editor-panel">
          <div className="editor-heading">
            <span className="eyebrow">{tr("PRIVATE GENERATOR")}</span>
            <h1>{tr(document.kind === 'invoice' ? 'Create a professional invoice' : 'Create a professional quote')}</h1>
            <p>{tr("No accounts, no database, no stored documents. Fill it, preview it, download it.")}</p>
          </div>

          <div className="privacy-strip">
            <ShieldCheck size={18} />
            <span>{tr("This app does not store user data. Uploaded logos and form values only live in this browser tab until you leave or reset.")}</span>
          </div>

          <div className="tabs">
            <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>{tr("Content")}</button>
            <button className={activeTab === 'style' ? 'active' : ''} onClick={() => setActiveTab('style')}>{tr("Branding")}</button>
            <button className={activeTab === 'options' ? 'active' : ''} onClick={() => setActiveTab('options')}>{tr("Options")}</button>
          </div>

          {activeTab === 'content' ? (
            <>
              <EditorSection title={tr("Your company")}>
                <div className="logo-uploader" onClick={() => fileRef.current?.click()}>
                  {document.logo ? <img src={document.logo} alt={tr("Uploaded logo")} /> : <span className="upload-icon"><ImagePlus size={21} /></span>}
                  <div>
                    <strong>{document.logo ? tr("Change logo") : tr("Add custom logo")}</strong>
                    <small>{tr("PNG, JPG or SVG - max 3 MB")}</small>
                  </div>
                  {document.logo ? <button className="remove-logo" onClick={event => { event.stopPropagation(); update('logo', '') }}><X size={16} /></button> : null}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={event => uploadLogo(event.target.files?.[0])} />
                <div className="field-grid">
                  <Field label={tr("Company name")} value={document.businessName} onChange={value => update('businessName', value)} />
                  <Field label={tr("Email")} type="email" value={document.businessEmail} onChange={value => update('businessEmail', value)} />
                  <Field label={tr("Phone")} value={document.businessPhone} onChange={value => update('businessPhone', value)} />
                  <Field label={tr("ICE / Tax ID")} value={document.businessTaxId} onChange={value => update('businessTaxId', value)} />
                  <Field className="full" label={tr("IF / RC / Patente")} value={document.businessRegistry} onChange={value => update('businessRegistry', value)} />
                  <Field className="full" label={tr("Address")} multiline value={document.businessAddress} onChange={value => update('businessAddress', value)} />
                </div>
              </EditorSection>

              <EditorSection title={tr("Client")}>
                <div className="field-grid">
                  <Field label={tr("Client name")} value={document.clientName} onChange={value => update('clientName', value)} />
                  <Field label={tr("Client email")} type="email" value={document.clientEmail} onChange={value => update('clientEmail', value)} />
                  <Field className="full" label={tr("Client address")} multiline value={document.clientAddress} onChange={value => update('clientAddress', value)} />
                </div>
              </EditorSection>

              <EditorSection title={tr("Document details")}>
                <div className="field-grid three">
                  <Field label={tr("Custom title")} value={document.documentTitle} onChange={value => update('documentTitle', value)} placeholder={dictionary[document.language][document.kind]} />
                  <Field label={tr("Number")} value={document.documentNumber} onChange={value => update('documentNumber', value)} />
                  <label className="field">
                    <span>{tr("Currency")}</span>
                    <div className="select-wrap">
                      <select value={document.currency} onChange={event => update('currency', event.target.value)}>
                        {Object.entries(currencies).map(([code]) => <option key={code} value={code}>{code} — {new Intl.DisplayNames([document.language], { type: 'currency' }).of(code)}</option>)}
                      </select>
                      <ChevronDown size={16} />
                    </div>
                  </label>
                  <Field label={tr("Issue date")} type="date" value={document.issueDate} onChange={value => update('issueDate', value)} />
                  <Field label={document.kind === 'quote' ? tr("Valid until") : tr("Due date")} type="date" value={document.dueDate} onChange={value => update('dueDate', value)} />
                </div>
              </EditorSection>

              <EditorSection title={tr("Products and services")}>
                <div className="items-editor">
                  <div className="items-head"><span>{tr("Description")}</span><span>{tr("Qty")}</span><span>{tr("Price")}</span><span></span></div>
                  {document.items.map(item => (
                    <div className="item-row" key={item.id}>
                      <input aria-label={tr("Description")} value={item.description} placeholder={tr("Description")} onChange={event => updateItem(item.id, 'description', event.target.value)} />
                      <input aria-label={tr("Quantity")} type="number" min="0" step="1" value={item.quantity} onChange={event => updateItem(item.id, 'quantity', Number(event.target.value))} />
                      <input aria-label={tr("Price")} type="number" min="0" step="0.01" value={item.price} onChange={event => updateItem(item.id, 'price', Number(event.target.value))} />
                      <button aria-label={tr("Remove line")} onClick={() => removeItem(item.id)} disabled={document.items.length === 1}><Trash2 size={17} /></button>
                    </div>
                  ))}
                </div>
                <button className="text-button" onClick={addItem}><Plus size={17} /> {tr("Add line")}</button>
              </EditorSection>

              <EditorSection title={tr("Totals and notes")}>
                <div className="field-grid three">
                  <Field label={tr("Tax (%)")} type="number" value={document.taxRate} onChange={value => update('taxRate', Number(value))} />
                  <Field label={tr("Discount")} type="number" value={document.discount} onChange={value => update('discount', Number(value))} />
                  <Field label={tr("Paid amount")} type="number" value={document.paidAmount} onChange={value => update('paidAmount', Number(value))} />
                  <Field className="full" label={tr("Bank details / RIB")} value={document.bankDetails} onChange={value => update('bankDetails', value)} />
                  <Field className="full" label={tr("Notes")} multiline value={document.notes} onChange={value => update('notes', value)} />
                  <Field className="full" label={tr("Terms")} multiline value={document.paymentTerms} onChange={value => update('paymentTerms', value)} />
                  <Field className="full" label={tr("Footer")} value={document.footerText} onChange={value => update('footerText', value)} />
                </div>
              </EditorSection>
            </>
          ) : null}

          {activeTab === 'style' ? (
            <EditorSection title={tr("Branding and layout")}>
              <div className="setting-block">
                <label><Palette size={15} /> {tr("Accent color")}</label>
                <div className="color-picker">
                  {brandColors.map(color => (
                    <button key={color} className={document.accentColor === color ? 'selected' : ''} style={{ background: color }} aria-label={`${tr('Color')} ${color}`} onClick={() => update('accentColor', color)}>
                      {document.accentColor === color ? <Check size={17} /> : null}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-grid">
                <Segmented label={tr("Template")} value={document.template} choices={templates.map(choice => ({ ...choice, label: tr(choice.label) }))} onChange={value => update('template', value as TemplateStyle)} />
                <Segmented label={tr("Logo position")} value={document.logoPosition} choices={logoPositions.map(choice => ({ ...choice, label: tr(choice.label) }))} onChange={value => update('logoPosition', value as LogoPosition)} />
                <label className="field full">
                  <span>{tr('Logo size')}: {document.logoSize}px</span>
                  <input type="range" min="34" max="96" value={document.logoSize} onChange={event => update('logoSize', Number(event.target.value))} />
                </label>
                <Segmented label={tr("Language")} value={document.language} choices={[{ id: 'fr', label: 'FR' }, { id: 'en', label: 'EN' }]} onChange={value => update('language', value as 'fr' | 'en')} />
              </div>
            </EditorSection>
          ) : null}

          {activeTab === 'options' ? (
            <EditorSection title={tr("Document sections")}>
              <div className="option-grid">
                <Toggle label={tr("Show tax")} checked={document.options.showTax} onChange={value => updateOption('showTax', value)} />
                <Toggle label={tr("Show discount")} checked={document.options.showDiscount} onChange={value => updateOption('showDiscount', value)} />
                <Toggle label={tr("Show paid amount")} checked={document.options.showPaidAmount} onChange={value => updateOption('showPaidAmount', value)} disabled={document.kind === 'quote'} />
                <Toggle label={tr("Show bank details")} checked={document.options.showBankDetails} onChange={value => updateOption('showBankDetails', value)} />
                <Toggle label={tr("Show legal IDs")} checked={document.options.showLegalIds} onChange={value => updateOption('showLegalIds', value)} />
                <Toggle label={tr("Show signature")} checked={document.options.showSignature} onChange={value => updateOption('showSignature', value)} />
              </div>
              <Field className="signature-field" label={tr("Signature label")} value={document.signatureLabel} onChange={value => update('signatureLabel', value)} />
            </EditorSection>
          ) : null}
        </section>

        <aside className="preview-panel">
          <div className="preview-toolbar">
            <span><Eye size={14} /> {tr("A4 preview")}</span>
            <span>{document.kind === 'quote' ? (document.language === 'fr' ? 'Devis' : 'Quote') : (document.language === 'fr' ? 'Facture' : 'Invoice')} - {document.currency}</span>
          </div>
          <div className="paper-wrap">
            <DocumentPreview ref={previewRef} document={document} totals={totals} money={money} />
          </div>
        </aside>
      </main>
    </div>
  )
}

function PrivacyModal({ onClose, language, onLanguageChange }: { onClose: () => void; language: 'fr' | 'en'; onLanguageChange: (language: 'fr' | 'en') => void }) {
  const tr = translator(language)
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <div className="privacy-modal">
        <LanguageSwitch language={language} onChange={onLanguageChange} />
        <span className="modal-icon"><ShieldCheck size={28} /></span>
        <h2 id="privacy-title">{tr("No data is stored")}</h2>
        <p>{tr("Factureo only generates your devis or facture in this browser tab. It does not create accounts, does not save documents, and does not store uploaded logos.")}</p>
        <div className="privacy-points">
          <span><BadgeCheck size={16} /> {tr("Create")}</span>
          <span><BadgeCheck size={16} /> {tr("Preview")}</span>
          <span><BadgeCheck size={16} /> {tr("Download PDF")}</span>
        </div>
        <button className="button primary" onClick={onClose}>{tr("I understand")}</button>
      </div>
    </div>
  )
}

function LanguageSwitch({ language, onChange }: { language: 'fr' | 'en'; onChange: (language: 'fr' | 'en') => void }) {
  return <div className="language-switch" role="group" aria-label="Français / English">
    {(['fr', 'en'] as const).map(value => <button key={value} type="button" lang={value} aria-label={value === 'fr' ? 'Français' : 'English'} aria-pressed={language === value} onClick={() => onChange(value)}>{value.toUpperCase()}</button>)}
  </div>
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="editor-section"><div className="section-title"><h2>{title}</h2></div>{children}</section>
}

function Field({ label, value, onChange, type = 'text', multiline, className = '', placeholder }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; multiline?: boolean; className?: string; placeholder?: string }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {multiline ? <textarea rows={2} value={value} onChange={event => onChange(event.target.value)} /> : <input type={type} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />}
    </label>
  )
}

function Segmented({ label, value, choices, onChange }: { label: string; value: string; choices: Array<{ id: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <div className="field segmented-field">
      <span>{label}</span>
      <div className="segmented">
        {choices.map(choice => <button key={choice.id} className={value === choice.id ? 'active' : ''} onClick={() => onChange(choice.id)}>{choice.label}</button>)}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`toggle ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" checked={checked && !disabled} disabled={disabled} onChange={event => onChange(event.target.checked)} />
      <span></span>
      <strong>{label}</strong>
    </label>
  )
}

const DocumentPreview = forwardRef<HTMLDivElement, { document: InvoiceData; totals: ReturnType<typeof calculate>; money: (value: number) => string }>(({ document, totals, money }, ref) => {
  const tr = translator(document.language)
  const t = dictionary[document.language]
  const title = document.documentTitle || (document.kind === 'quote' ? t.quote : t.invoice)
  const logoStyle = { width: document.logoSize, height: document.logoSize } as React.CSSProperties

  return (
    <div className={`invoice-paper template-${document.template}`} ref={ref}>
      <div className="invoice-accent"></div>
      <div className={`invoice-header logo-${document.logoPosition}`}>
        <div className="invoice-brand">
          {document.logo ? <img src={document.logo} alt={tr("Company logo")} style={logoStyle} /> : <div className="logo-placeholder" style={logoStyle}><FileText size={26} /></div>}
          <div>
            <h2>{document.businessName || tr('Company name')}</h2>
            <p>{document.businessEmail}</p>
          </div>
        </div>
        <div className="invoice-title">
          <span>{title}</span>
          <strong>{document.documentNumber}</strong>
        </div>
      </div>

      <div className="invoice-parties">
        <div>
          <label>{t.from}</label>
          <strong>{document.businessName}</strong>
          <p>{document.businessAddress}</p>
          <p>{document.businessPhone}</p>
          {document.options.showLegalIds ? <><p>{document.businessTaxId}</p><p>{document.businessRegistry}</p></> : null}
        </div>
        <div>
          <label>{t.billTo}</label>
          <strong>{document.clientName || '-'}</strong>
          <p>{document.clientAddress}</p>
          <p>{document.clientEmail}</p>
        </div>
        <div className="invoice-dates">
          <p><span>{t.number}</span><strong>{document.documentNumber || '-'}</strong></p>
          <p><span>{t.issued}</span><strong>{formatDate(document.issueDate, document.language)}</strong></p>
          <p><span>{document.kind === 'quote' ? t.validUntil : t.due}</span><strong>{formatDate(document.dueDate, document.language)}</strong></p>
        </div>
      </div>

      <table className="invoice-table">
        <thead><tr><th>{t.description}</th><th>{t.qty}</th><th>{t.unitPrice}</th><th>{t.amount}</th></tr></thead>
        <tbody>
          {document.items.map(item => (
            <tr key={item.id}>
              <td>{item.description || '-'}</td>
              <td>{item.quantity}</td>
              <td>{money(item.price)}</td>
              <td>{money(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div className="invoice-notes">
          {document.notes ? <div><label>{t.notes}</label><p>{document.notes}</p></div> : null}
          {document.paymentTerms ? <div><label>{t.payment}</label><p>{document.paymentTerms}</p></div> : null}
          {document.options.showBankDetails && document.bankDetails ? <div><label>{t.bank}</label><p>{document.bankDetails}</p></div> : null}
        </div>
        <div className="totals">
          <p><span>{t.subtotal}</span><strong>{money(totals.subtotal)}</strong></p>
          {document.options.showDiscount && document.discount > 0 ? <p><span>{t.discount}</span><strong>- {money(totals.discount)}</strong></p> : null}
          {document.options.showTax ? <p><span>{t.tax} ({document.taxRate}%)</span><strong>{money(totals.tax)}</strong></p> : null}
          <p className="total-line"><span>{document.kind === 'quote' ? t.quoteTotal : t.total}</span><strong>{money(totals.total)}</strong></p>
          {document.kind === 'invoice' && document.options.showPaidAmount && document.paidAmount > 0 ? <p><span>{t.paid}</span><strong>- {money(document.paidAmount)}</strong></p> : null}
          {document.kind === 'invoice' ? <div><span>{t.balance}</span><strong>{money(totals.balance)}</strong></div> : null}
        </div>
      </div>

      {document.options.showSignature ? (
        <div className="signature-box">
          <label>{t.signature}</label>
          <span>{document.signatureLabel}</span>
        </div>
      ) : null}

      {document.footerText.trim() ? (
        <div className="invoice-footer">
          <p>{document.footerText}</p>
        </div>
      ) : null}
    </div>
  )
})

export default App

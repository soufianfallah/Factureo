export type Language = 'fr' | 'en'
export type DocumentKind = 'invoice' | 'quote'
export type LogoPosition = 'left' | 'center' | 'right'
export type TemplateStyle = 'classic' | 'modern' | 'minimal'

export interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}

export interface DocumentOptions {
  showTax: boolean
  showDiscount: boolean
  showPaidAmount: boolean
  showBankDetails: boolean
  showLegalIds: boolean
  showSignature: boolean
}

export interface InvoiceData {
  kind: DocumentKind
  language: Language
  template: TemplateStyle
  logo: string
  logoPosition: LogoPosition
  logoSize: number
  accentColor: string
  documentTitle: string
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessTaxId: string
  businessRegistry: string
  bankDetails: string
  clientName: string
  clientEmail: string
  clientAddress: string
  documentNumber: string
  issueDate: string
  dueDate: string
  currency: string
  taxRate: number
  discount: number
  paidAmount: number
  items: LineItem[]
  notes: string
  paymentTerms: string
  footerText: string
  signatureLabel: string
  options: DocumentOptions
}

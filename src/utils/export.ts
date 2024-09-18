import jsPDF from 'jspdf'
import type { DataModel } from 'convex/_generated/dataModel.js'
import { getLocalDateString, getLocalTimeString, getWorktime } from '.'

const TABLE_HEADER = ['Date', 'Start', 'Stop', 'Duration']
const PAGE_BREAK_THRESHOLD = 250
const INITIAL_Y_POSITION = 30
const ROW_HEIGHT = 10

export const createPDFExport = (
  entries: DataModel['time_entries']['document'][],
  title: string,
  subject: string = '',
  author: string = '',
  keywords: string = '',
  creator: string = ''
): void => {
  if (!entries?.length) {
    throw new Error('Invalid Entries')
  }

  const pdf = new jsPDF()

  try {
    setPDFProperties(pdf, title, subject, author, keywords, creator)
    addHeader(pdf, title)
    addTable(pdf, entries)

    const fileName = `time_entries_${title}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('Error exporting to PDF: ' + error)
  }
}

function setPDFProperties(
  pdf: jsPDF,
  title: string,
  subject: string,
  author: string,
  keywords: string,
  creator: string
): void {
  pdf.setProperties({ title, subject, author, keywords, creator })
}

function addHeader(pdf: jsPDF, title: string): void {
  pdf.setFontSize(16).text('Working time report', 10, 10)
  pdf.setFontSize(12).text(`Project: ${title}`, 10, 20)
}

function addTable(pdf: jsPDF, entries: DataModel['time_entries']['document'][]): void {
  pdf.setFontSize(10)
  let y = INITIAL_Y_POSITION

  addTableHeader(pdf, y)
  y += ROW_HEIGHT

  entries.forEach((entry) => {
    if (!entry.end_time) return

    const row = [
      getLocalDateString(entry.start_time),
      getLocalTimeString(entry.start_time),
      getLocalTimeString(entry.end_time || 0),
      getWorktime(entry.end_time - entry.start_time)
    ]

    addTableRow(pdf, row, y)
    y += ROW_HEIGHT

    if (y > PAGE_BREAK_THRESHOLD) {
      pdf.addPage()
      y = 20
    }
  })
}

function addTableHeader(pdf: jsPDF, y: number): void {
  TABLE_HEADER.forEach((header, index) => {
    pdf.text(header, 10 + index * 45, y)
  })
}

function addTableRow(pdf: jsPDF, row: string[], y: number): void {
  row.forEach((cell, index) => {
    pdf.text(cell.toString(), 10 + index * 45, y)
  })
}

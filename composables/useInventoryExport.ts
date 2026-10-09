import type { Category, Product, StockMovement } from '~/types/inventory'

export function useInventoryExport() {
  async function exportToExcel(movements: StockMovement[], searchFilter: string, typeFilter: string) {
    const { utils, writeFile } = await import('xlsx-js-style')
    const exportDate = new Date()

    const rows = movements.map(m => ({
      Waktu: m.createdAt?.toLocaleString('id-ID') ?? 'Baru saja',
      Produk: m.productName,
      SKU: m.sku,
      Jenis: m.type === 'in' ? 'Stok masuk' : 'Stok keluar',
      Jumlah: m.quantity,
      'Stok Sebelum': m.previousStock,
      'Stok Sesudah': m.newStock,
      Alasan: m.reason,
      Admin: m.adminEmail,
    }))

    const sheet = utils.aoa_to_sheet([])
    utils.sheet_add_json(sheet, rows, { origin: 'A7' })

    const totalIn = movements.filter(i => i.type === 'in').reduce((s, i) => s + i.quantity, 0)
    const totalOut = movements.filter(i => i.type === 'out').reduce((s, i) => s + i.quantity, 0)

    const summary = [
      ['Diekspor pada', exportDate.toLocaleString('id-ID')],
      ['Filter pencarian', searchFilter || 'Semua data'],
      ['Filter jenis', typeFilter === 'in' ? 'Stok masuk' : typeFilter === 'out' ? 'Stok keluar' : 'Semua jenis'],
      ['Total baris', movements.length],
      ['Total stok masuk', totalIn],
      ['Total stok keluar', totalOut],
    ]
    utils.sheet_add_aoa(sheet, summary, { origin: 'A1' })

    const headerRow = 7
    const border = { style: 'thin', color: { rgb: 'D9E2F3' } }
    const headerStyle = {
      fill: { fgColor: { rgb: '1D4ED8' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { top: border, bottom: border, left: border, right: border },
    }

    for (let c = 0; c < 9; c++) {
      const cell = sheet[utils.encode_cell({ r: headerRow - 1, c })]
      if (cell) cell.s = headerStyle
    }

    for (let r = headerRow; r < headerRow + rows.length; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = sheet[utils.encode_cell({ r, c })]
        if (cell) {
          cell.s = {
            border: { top: border, bottom: border, left: border, right: border },
            alignment: { vertical: 'center', wrapText: c === 7 },
          }
        }
      }
      const typeCell = sheet[utils.encode_cell({ r, c: 3 })]
      if (typeCell) {
        typeCell.s = {
          ...typeCell.s,
          font: { bold: true, color: { rgb: typeCell.v === 'Stok masuk' ? '047857' : 'BE123C' } },
        }
      }
    }

    sheet['!cols'] = [
      { wch: 22 },
      { wch: 24 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 38 },
      { wch: 30 },
    ]
    sheet['!rows'] = [{ hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 26 }]
    sheet['!autofilter'] = { ref: `A${headerRow}:I${Math.max(headerRow, headerRow + rows.length - 1)}` }
    sheet['!freeze'] = { xSplit: 0, ySplit: headerRow }

    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, sheet, 'Riwayat Stok')
    writeFile(workbook, `laporan-pergerakan-stok-${exportDate.toISOString().slice(0, 10)}.xlsx`)
  }

  return { exportToExcel }
}

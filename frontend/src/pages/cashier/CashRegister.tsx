import React, { useState, useEffect, ReactNode } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { CashRegisterIcon, CalendarIcon, UserIcon, TrendingUpIcon, TrendingDownIcon, FileTextIcon, DownloadIcon, FilterIcon, ClockIcon, WalletIcon, ReceiptIcon } from '../../components/common/Icons';
import { cashRegisterService } from '../../services/cashRegisterService';
import type { CashRegisterClose } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type FilterType = 'all' | 'daily' | 'monthly' | 'annual';
type ExportType = 'last' | 'daily' | 'monthly' | 'annual';

const formatCurrency = (value: number | string | undefined): string =>
  new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0
  }).format(parseFloat(String(value)) || 0).replace('COP', '$');

const formatDateTime = (dateTime: string | undefined): string => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit',
  });
};

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toMonthStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const filterCloses = (
  closes: CashRegisterClose[],
  type: FilterType | ExportType,
  date: string,
  month: string,
  year: string,
): CashRegisterClose[] => {
  if (type === 'all' || type === 'last') return closes;
  return closes.filter((c) => {
    if (!c.closingDate) return false;
    const d = new Date(c.closingDate);
    if (type === 'daily') return toDateStr(d) === date;
    if (type === 'monthly') return toMonthStr(d) === month;
    if (type === 'annual') return d.getFullYear().toString() === year;
    return true;
  });
};

const CashRegister: React.FC = () => {
  const [closes, setCloses] = useState<CashRegisterClose[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<FilterType>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClose, setSelectedClose] = useState<CashRegisterClose | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('last');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await cashRegisterService.getAll();
      setCloses(data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCloses = filterCloses(closes, filterType, selectedDate, selectedMonth, selectedYear);
  const totalSales = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (Number(c.totalSales) || 0), 0);
  const totalTransactions = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (c.totalTransactions || 0), 0);
  const totalDifference = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (Number(c.difference) || 0), 0);

  const getExportCloses = (): CashRegisterClose[] => {
    if (exportType === 'last') return closes.length > 0 ? [closes[0]] : [];
    return filterCloses(closes, exportType, exportDate, exportMonth, exportYear);
  };

  const getExportLabel = (): string => {
    if (exportType === 'last') return 'Último Cierre';
    if (exportType === 'daily') return `Día: ${exportDate}`;
    if (exportType === 'monthly') return `Mes: ${exportMonth}`;
    if (exportType === 'annual') return `Año: ${exportYear}`;
    return 'Reporte General';
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleGeneratePDF = () => {
    const closesToExport = getExportCloses();
    if (closesToExport.length === 0) return;

    let closesToPrint = closesToExport;

    if (exportType === 'monthly' || exportType === 'annual') {
      const isAnnual = exportType === 'annual';
      const sortedCloses = [...closesToExport].sort((a, b) =>
        new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime()
      );
      const initialAmount = sortedCloses[0]?.initialAmount || 0;
      const consolidatedClose = closesToExport.reduce((acc, close) => {
        acc.finalAmount += (close.finalAmount || 0);
        acc.expectedAmount += (close.expectedAmount || 0);
        acc.totalSales += (close.totalSales || 0);
        acc.totalTransactions += (close.totalTransactions || 0);
        acc.cashAmount = (acc.cashAmount || 0) + (close.cashAmount || 0);
        acc.transferAmount = (acc.transferAmount || 0) + (close.transferAmount || 0);
        acc.cardAmount = (acc.cardAmount || 0) + (close.cardAmount || 0);
        acc.difference += (close.difference || 0);

        if (close.itemSales) {
          close.itemSales.forEach(item => {
            const existingItem = acc.itemSales!.find(i => i.name === item.name && i.categoryName === item.categoryName && i.presentationName === item.presentationName);
            if (existingItem) {
              existingItem.quantity += item.quantity;
              existingItem.total += item.total;
            } else {
              acc.itemSales!.push({ ...item });
            }
          });
        }
        
        return acc;
      }, {
        id: -1,
        closingDate: new Date().toISOString(),
        initialAmount: initialAmount,
        finalAmount: 0,
        expectedAmount: 0,
        totalSales: 0,
        totalTransactions: 0,
        cashAmount: 0,
        transferAmount: 0,
        cardAmount: 0,
        difference: 0,
        closedBy: isAnnual ? 'Consolidado Anual' : 'Consolidado Mensual',
        notes: `Consolidado de ${closesToExport.length} cierres en el ${isAnnual ? 'año ' + exportYear : 'mes de ' + exportMonth}`,
        itemSales: []
      } as CashRegisterClose);

      consolidatedClose.expectedAmount = consolidatedClose.totalSales;
      consolidatedClose.finalAmount = consolidatedClose.totalSales;
      
      closesToPrint = [consolidatedClose];
    }

    const doc = new jsPDF();
    const title = `REPORTE DE CIERRE - ${getExportLabel()}`;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 41, 54);
    doc.text("LA BOMBONERA GRANIZADOS", 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(title, 105, 28, { align: 'center' });
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 34, { align: 'center' });

    closesToPrint.forEach((close, index) => {
      if (index > 0) doc.addPage();

      doc.setTextColor(33, 41, 54);
      let reportTitle = `DETALLE DE CIERRE #${close.id}`;
      if (close.id === -1) {
        if (exportType === 'monthly') {
          const [yyyy, mm] = exportMonth.split('-');
          const monthName = new Date(parseInt(yyyy), parseInt(mm) - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' }).toUpperCase();
          reportTitle = `REPORTE MENSUAL: ${monthName}`;
        } else if (exportType === 'annual') {
          reportTitle = `REPORTE ANUAL: ${exportYear}`;
        } else {
          reportTitle = 'REPORTE CONSOLIDADO GENERAL';
        }
      }
      
      doc.setFontSize(close.id === -1 ? 18 : 14);
      doc.setFont('helvetica', close.id === -1 ? 'bold' : 'normal');
      doc.text(reportTitle, 14, 50);
      doc.setFont('helvetica', 'normal');

      doc.setFontSize(10);
      doc.text(`Responsable: ${close.closedBy || 'N/A'}`, 14, 58);
      
      let dateLabel = formatDateTime(close.closingDate);
      if (close.id === -1) {
        dateLabel = exportType === 'annual' ? exportYear : exportMonth;
      }
      doc.text(close.id === -1 ? `Rango: ${dateLabel}` : `Fecha: ${dateLabel}`, 14, 64);

      // Financial Summary Table
      autoTable(doc, {
        startY: 70,
        head: [['Concepto', 'Valor']],
        body: [
          ['Monto Inicial', formatCurrency(close.initialAmount)],
          ['Ventas Totales', formatCurrency(close.totalSales)],
               ['Ventas en Efectivo', formatCurrency(close.cashAmount)],
               ['Ventas en Transferencia', formatCurrency(close.transferAmount)],
          ['Monto Esperado', formatCurrency(close.expectedAmount)],
          ['Monto Final (Caja)', formatCurrency(close.finalAmount)],
          ['Diferencia', formatCurrency(close.difference)],
          ['Total Transacciones', `${close.totalTransactions} Tickets`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [33, 41, 54], textColor: [255, 255, 255] }
      });

      let currentY = (doc as any).lastAutoTable.finalY || 130;

      // Item Sales Summary — formato agrupado por categoría → sabor → presentación
      if (close.itemSales && close.itemSales.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(33, 41, 54);
        doc.text("DESGLOSE DE VENTAS POR CATEGORÍA", 14, currentY + 15);
        currentY += 20;

        // 1) Agrupar items por categoría
        const groupedByCategory = close.itemSales.reduce((acc, item) => {
          const cat = item.categoryName || 'Otros';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {} as Record<string, any[]>);

        Object.entries(groupedByCategory).forEach(([category, categoryItems]) => {
          // 2) Dentro de cada categoría, agrupar por sabor (name)
          const groupedByFlavor = categoryItems.reduce((acc, item) => {
            if (!acc[item.name]) acc[item.name] = [];
            acc[item.name].push(item);
            return acc;
          }, {} as Record<string, any[]>);

          const catTotal = categoryItems.reduce((sum, i) => sum + i.total, 0);

          // --- Category header (dark bar) ---
          if (currentY > 240) { doc.addPage(); currentY = 20; }
          doc.setFillColor(33, 41, 54);
          doc.rect(14, currentY, 182, 7, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(category.toUpperCase(), 18, currentY + 5);
          currentY += 11;
          doc.setTextColor(33, 41, 54);

          // --- Each flavor ---
          Object.entries(groupedByFlavor).forEach(([flavor, flavorItems]) => {
            if (currentY > 250) { doc.addPage(); currentY = 20; }

            const flavorTotal = flavorItems.reduce((sum, i) => sum + i.total, 0);

            // Flavor name
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(flavor, 18, currentY + 3);
            currentY += 7;

            // Presentation rows table
            autoTable(doc, {
              startY: currentY,
              head: [['Presentación', 'Cant.', 'V. Unitario', 'Subtotal']],
              body: flavorItems.map(item => [
                item.presentationName || '—',
                String(item.quantity),
                formatCurrency(item.unitPrice),
                formatCurrency(item.total),
              ]),
              theme: 'plain',
              headStyles: {
                fillColor: [71, 85, 105],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7,
              },
              styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 } },
              margin: { left: 18 },
              tableLineWidth: 0,
              tableLineColor: [220, 220, 220],
            });

            currentY = (doc as any).lastAutoTable.finalY || currentY + 2;

            // Flavor subtotal line
            doc.setDrawColor(210, 210, 210);
            doc.line(18, currentY + 1, 196, currentY + 1);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`Subtotal ${flavor}: ${formatCurrency(flavorTotal)}`, 196, currentY + 5, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            currentY += 9;
          });

          // --- Category total ---
          if (currentY > 265) { doc.addPage(); currentY = 20; }
          doc.setDrawColor(33, 41, 54);
          doc.setLineWidth(0.6);
          doc.line(14, currentY, 196, currentY);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`TOTAL ${category.toUpperCase()}: ${formatCurrency(catTotal)}`, 14, currentY + 6);
          doc.setFont('helvetica', 'normal');
          doc.setLineWidth(0.2);
          currentY += 12;
        });

        // --- Total Operativo (doble línea) ---
        if (currentY > 270) { doc.addPage(); currentY = 20; }
        const finalTotal = close.itemSales.reduce((sum, i) => sum + i.total, 0);
        doc.setDrawColor(33, 41, 54);
        doc.setLineWidth(1.2);
        doc.line(14, currentY, 196, currentY);
        doc.setFontSize(13);
        doc.setTextColor(33, 41, 54);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL OPERATIVO: ${formatCurrency(finalTotal)}`, 14, currentY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setLineWidth(0.2);
        currentY += 14;
      }

      if (close.notes) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Observaciones:", 14, currentY + 10);
        doc.setFontSize(9);
        doc.text(close.notes, 14, currentY + 16, { maxWidth: 180 });
      }
    });

    doc.save(`Reporte_Caja_${getExportLabel().replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <Loading type="card" message="Preparando balances financieros..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Bitácora de Caja"
          subtitle="Historial consolidado de cierres fiscales y auditoría."
          icon={<CashRegisterIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <button
              onClick={() => setShowExportModal(true)}
              disabled={closes.length === 0}
              className="h-12 sm:h-14 px-5 sm:px-8 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 sm:gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              <DownloadIcon size={18} /> REPORTE PDF
            </button>
          }
        />

        {/* Financial Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
           <Card className="border-2 border-muted/60 relative group">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-muted/60 rounded-xl"><FileTextIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Arqueos Ejecutados</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tighter">{filteredCloses.length}</span>
                    <span className="text-xs font-black text-muted-foreground uppercase opacity-40">Periodo</span>
                 </div>
              </div>
           </Card>

           <Card className="border-2 border-primary/20 bg-primary/5 relative group">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-xl"><TrendingUpIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Total Recaudado</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black text-primary/40 uppercase">$</span>
                    <span className="text-3xl font-black tracking-tighter text-primary">{totalSales.toLocaleString('es-CO')}</span>
                 </div>
              </div>
           </Card>

           <Card className="border-2 border-muted/60 relative group">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-muted/60 rounded-xl"><ReceiptIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Comandas</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tighter">{totalTransactions}</span>
                    <span className="text-xs font-black text-muted-foreground uppercase opacity-40">Tickets</span>
                 </div>
              </div>
           </Card>

            <Card className={`border-2 relative group ${totalDifference < 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
               <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${totalDifference < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                     <div className={`p-2 rounded-xl ${totalDifference < 0 ? 'bg-rose-500/15' : 'bg-emerald-500/15'}`}>
                        {totalDifference < 0 ? <TrendingDownIcon size={18} /> : <TrendingUpIcon size={18} />}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Diferencia Neta</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <span className={`text-xs font-black uppercase opacity-40 ${totalDifference < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>$</span>
                     <span className={`text-3xl font-black tracking-tighter ${totalDifference < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {totalDifference.toLocaleString('es-CO')}
                     </span>
                  </div>
               </div>
            </Card>
        </div>

        {/* Filters and List */}
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-card p-4 sm:p-6 rounded-3xl sm:rounded-5xl border-2 border-muted/40 shadow-sm flex flex-col sm:flex-row items-end gap-3 sm:gap-6 transition-all hover:border-primary/20">
              <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Segmentación</label>
                 <div className="relative">
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className="w-full h-12 px-5 bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl outline-none font-black text-xs uppercase appearance-none transition-all cursor-pointer"
                    >
                      <option value="all">Reporte Histórico</option>
                      <option value="daily">Auditoría Diaria</option>
                      <option value="monthly">Balance Mensual</option>
                      <option value="annual">Resumen Anual</option>
                    </select>
                    <FilterIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                 </div>
              </div>

              {filterType === 'daily' && (
                <div className="flex flex-col gap-2 w-full md:w-auto animate-in slide-in-from-left-2 transition-all">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Fecha de Selección</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-12 px-5 bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-xs" />
                </div>
              )}

              {filterType === 'monthly' && (
                <div className="flex flex-col gap-2 w-full md:w-auto animate-in slide-in-from-left-2 transition-all">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Mes Contable</label>
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-12 px-5 bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-xs uppercase" />
                </div>
              )}

              {filterType === 'annual' && (
                <div className="flex flex-col gap-2 w-full md:w-auto animate-in slide-in-from-left-2 transition-all">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Ejercicio Fiscal</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="h-12 px-8 bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl outline-none font-black text-xs">
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}

              <div className="ml-auto p-4 bg-muted/10 rounded-2xl border-2 border-dashed border-muted/40 hidden lg:flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-muted-foreground uppercase">Registros Coincidentes</p>
                    <p className="font-black text-lg leading-none tracking-tighter">{filteredCloses.length}</p>
                 </div>
                 <div className="w-1 h-8 bg-muted/40 rounded-full" />
                 <CalendarIcon size={20} className="text-muted-foreground opacity-40" />
              </div>
           </div>

           {/* Results List */}
           <div className="grid grid-cols-1 gap-4">
              {filteredCloses.map((item) => (
                 <div
                   key={item.id}
                   onClick={() => { setSelectedClose(item); setShowDetailModal(true); }}
                   className="group bg-card p-4 sm:p-5 rounded-3xl sm:rounded-5xl border-2 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 active:scale-[0.99]"
                 >
                   <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 bg-muted/40 rounded-3xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                         <CashRegisterIcon size={28} />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Firma Cierre #{item.id}</span>
                            <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary uppercase rounded-lg px-2">Auditado</Badge>
                         </div>
                         <h4 className="text-xl font-black tracking-tighter uppercase leading-none">{formatDateTime(item.closingDate)}</h4>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 italic">
                            <UserIcon size={12} /> Responsable: {item.closedBy || 'N/A'}
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 sm:gap-14 overflow-x-auto no-scrollbar">
                      <div className="space-y-1 shrink-0">
                         <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Recaudación</p>
                         <p className="font-black text-foreground text-base sm:text-xl tracking-tighter">{formatCurrency(item.totalSales)}</p>
                      </div>
                      <div className="space-y-1 shrink-0">
                         <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Balance</p>
                         <p className={`font-black text-base sm:text-lg tracking-tighter ${(Number(item.difference) || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {(Number(item.difference) || 0).toLocaleString('es-CO')}
                         </p>
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all ml-auto shrink-0">
                         <ClockIcon size={16} />
                      </div>
                   </div>
                </div>
              ))}

              {filteredCloses.length === 0 && (
                <div className="text-center py-40 bg-muted/10 rounded-8xl border-2 border-dashed border-muted shadow-inner animate-in fade-in zoom-in duration-700">
                    <div className="bg-card border border-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-muted">
                       <FileTextIcon size={40} className="text-muted-foreground opacity-20" />
                    </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground mb-2">Historial Vacío</h3>
                   <p className="text-muted-foreground/60 font-medium italic max-w-xs mx-auto">No se encontraron cierres de caja registrados bajo los criterios de filtrado actuales.</p>
                </div>
              )}
           </div>
        </div>

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="COMPROBANTE DE AUDITORÍA" size="medium">
          {selectedClose && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 py-2">
               <div className="bg-primary/5 p-6 rounded-5xl border border-primary/10 flex items-center gap-6">
                   <div className="w-20 h-20 bg-card border border-muted rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                      <CashRegisterIcon size={40} />
                   </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">ID Transacción</p>
                     <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">CIERRE #{selectedClose.id}</h3>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 px-2">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Marca Temporal</p>
                     <p className="font-bold text-foreground flex items-center gap-2"><CalendarIcon size={14} className="text-secondary" /> {formatDateTime(selectedClose.closingDate)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Firmado Por</p>
                     <p className="font-bold text-foreground flex items-center gap-2 justify-end uppercase tracking-tight italic"><UserIcon size={14} className="text-secondary" /> {selectedClose.closedBy || 'ADMIN'}</p>
                  </div>
                  
                  <Separator className="col-span-2 bg-muted/60 border-dashed" />

                  <div className="space-y-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Efectivo Inicial</p>
                        <p className="font-black text-xl tracking-tighter">{formatCurrency(selectedClose.initialAmount)}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Monto Esperado</p>
                        <p className="font-black text-xl tracking-tighter text-amber-600">{formatCurrency(selectedClose.expectedAmount)}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Arqueo Final</p>
                        <p className="font-black text-xl tracking-tighter">{formatCurrency(selectedClose.finalAmount)}</p>
                     </div>
                  </div>
                  <div className="space-y-6 text-right">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Suma Ventas</p>
                        <p className="font-black text-xl tracking-tighter text-primary">{formatCurrency(selectedClose.totalSales)}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">N° Operaciones</p>
                        <p className="font-black text-xl tracking-tighter">{selectedClose.totalTransactions || 0} Tickets</p>
                     </div>
                  </div>
               </div>

                <div className={`p-8 rounded-6xl border-4 flex flex-col items-center justify-center relative overflow-hidden group ${ (Number(selectedClose.difference) || 0) < 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20' }`}>
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-hover:scale-150">
                      <WalletIcon size={80} />
                   </div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1">Diferencia Final</p>
                   <h4 className={`text-5xl font-black tracking-widest ${ (Number(selectedClose.difference) || 0) < 0 ? 'text-rose-500' : 'text-emerald-500' }`}>
                      {selectedClose.difference.toLocaleString('es-CO')}
                   </h4>
                </div>

               {selectedClose.notes && (
                 <div className="space-y-3 px-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Justificación / Observaciones</label>
                    <div className="p-5 bg-muted/20 border-2 border-dashed border-muted/60 rounded-3xl text-sm font-bold text-foreground/60 italic leading-relaxed">
                       "{selectedClose.notes}"
                    </div>
                 </div>
               )}

                {/* Itemized Sales Breakdown by Category */}
               {selectedClose.itemSales && selectedClose.itemSales.length > 0 && (
                 <div className="space-y-6 px-2 pb-6">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Desglose de Ventas por Categoría</label>
                       <Badge variant="secondary" className="text-[8px] font-black uppercase">{selectedClose.itemSales.length} items</Badge>
                    </div>
                    
                    {Object.entries(
                      selectedClose.itemSales.reduce((acc, item) => {
                        const cat = item.categoryName || 'Otros';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(item);
                        return acc;
                      }, {} as Record<string, typeof selectedClose.itemSales>)
                    ).map(([category, items]) => {
                      const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between ml-1 pr-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <h5 className="text-[11px] font-black uppercase tracking-tighter text-foreground/80">{category}</h5>
                            </div>
                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                              {formatCurrency(categoryTotal)}
                            </span>
                          </div>
                          <div className="bg-card rounded-2xl border-2 border-muted/40 overflow-hidden shadow-sm">
                             <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/20">
                                   <tr>
                                      <th className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground">Producto</th>
                                      <th className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground text-center">Cant.</th>
                                      <th className="px-4 py-2 text-[8px] font-black uppercase text-muted-foreground text-right">Subtotal</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/40">
                                   {items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-muted/5 transition-colors">
                                          <td className="px-4 py-2.5 text-xs font-bold text-foreground">{item.presentationName ? `${item.name} (${item.presentationName})` : item.name}</td>
                                         <td className="px-4 py-2.5 text-xs font-black text-center">
                                            <span className="px-2 py-0.5 bg-muted rounded-lg">{item.quantity}</span>
                                         </td>
                                         <td className="px-4 py-2.5 text-xs font-black text-right text-primary/80">{formatCurrency(item.total)}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                        </div>
                      );
                    })}

                    <div className="bg-primary/5 p-4 rounded-3xl border-2 border-primary/10 flex justify-between items-center mt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total Operativo</span>
                      <span className="text-lg font-black text-primary tracking-tighter">
                        {formatCurrency(selectedClose.itemSales.reduce((acc, curr) => acc + curr.total, 0))}
                      </span>
                    </div>
                 </div>
               )}
            </div>
          )}
        </Modal>

        {/* Export Modal */}
        <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="CENTRO DE REPORTES" size="medium">
          <div className="space-y-8 py-2 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-slate-900 p-8 rounded-6xl text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-150 transition-transform duration-1000">
                   <DownloadIcon size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <FileTextIcon size={32} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tighter italic">Exportación de Datos</h3>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Generación de archivos PDF auditables</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                  <ExportOption 
                    type="last" 
                    current={exportType} 
                    onSelect={setExportType} 
                    label="Último Cierre Auditado" 
                    emoji={<ClockIcon size={20} />}
                    sub={closes.length > 0 ? `${formatDateTime(closes[0].closingDate)} — ${closes[0].closedBy}` : 'Sin registros'} 
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportOption type="daily" current={exportType} onSelect={setExportType} label="Cierre Diario" emoji={<CalendarIcon size={20} />}>
                      {exportType === 'daily' && <input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} className="mt-3 h-12 px-4 bg-background border-2 border-input rounded-xl font-bold text-xs" />}
                    </ExportOption>
                    <ExportOption type="monthly" current={exportType} onSelect={setExportType} label="Reporte Mensual" emoji={<CalendarIcon size={20} />}>
                      {exportType === 'monthly' && <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="mt-3 h-12 px-4 bg-background border-2 border-input rounded-xl font-bold text-xs uppercase" />}
                    </ExportOption>
                  </div>

                  <ExportOption type="annual" current={exportType} onSelect={setExportType} label="Balance Consolidado Anual" emoji={<FileTextIcon size={20} />}>
                  {exportType === 'annual' && (
                    <select value={exportYear} onChange={(e) => setExportYear(e.target.value)} className="mt-3 h-12 px-4 bg-background border-2 border-input rounded-xl font-black text-xs">
                      {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  )}
                </ExportOption>
             </div>

             <div className="bg-primary p-6 rounded-4xl flex flex-col items-center justify-center text-white shadow-xl shadow-primary/20 gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Impacto del Reporte</p>
                <h4 className="text-lg font-black tracking-tight">{getExportLabel()} — {getExportCloses().length} Documentos</h4>
                <button 
                   onClick={handleGeneratePDF} 
                   className="mt-4 w-full h-14 bg-primary-foreground text-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                   DESCARGAR AHORA
                </button>
             </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

// ===================== SUB-COMPONENTS =====================
interface ExportOptionProps {
  type: ExportType;
  current: ExportType;
  onSelect: (t: ExportType) => void;
  label: string;
  emoji: ReactNode;
  sub?: string;
  children?: ReactNode;
}

const ExportOption: React.FC<ExportOptionProps> = ({ type, current, onSelect, label, emoji, sub, children }) => (
  <div 
    onClick={() => onSelect(type)}
    className={`
      p-5 border-2 rounded-4xl cursor-pointer transition-all duration-300 relative overflow-hidden group
      ${current === type ? 'border-primary bg-primary/5 shadow-inner' : 'border-muted/60 hover:border-primary/20 bg-card hover:shadow-lg hover:shadow-primary/5'}
    `}
  >
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${current === type ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'}`}>
        {emoji}
      </div>
      <div className="flex-1">
        <span className={`block text-sm font-black uppercase tracking-tight ${current === type ? 'text-primary' : 'text-foreground/70'}`}>{label}</span>
        {sub && <span className="block text-[10px] font-bold text-muted-foreground/60 italic mt-0.5">{sub}</span>}
        {children}
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${current === type ? 'border-primary bg-primary text-primary-foreground' : 'border-muted/60'}`}>
         {current === type && <CheckCircleIcon size={14} className="animate-in zoom-in" />}
      </div>
    </div>
  </div>
);

const CheckCircleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default CashRegister;
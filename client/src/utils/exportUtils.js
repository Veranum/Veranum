import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const getFormattedDate = () => new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });

export const exportToXLSX = (reportData, meta) => {
    if (!reportData) throw new Error("No hay datos para exportar.");
    
    const wb = XLSX.utils.book_new();
    const { hotelName, monthName, selectedYear } = meta;

    // Hoja 1: Resumen General
    const resumenData = [
        ["Métrica", "Valor"],
        ["Ingresos por Habitaciones", Math.round(reportData.ingresosHabitaciones || 0)],
        ["Ingresos por Eventos", Math.round(reportData.ingresosEventos || 0)],
        ["Valor Total del Inventario", Math.round(reportData.valorTotalInventario || 0)],
        ["Ocupación Promedio", `${(reportData.ocupacionPromedioMes || 0).toFixed(1)}%`],
        ["ADR", `$${Math.round(reportData.adr || 0).toLocaleString('es-CL')}`],
        ["RevPAR", `$${Math.round(reportData.revPAR || 0).toLocaleString('es-CL')}`],
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");

    // Hoja 2: Detalle Habitaciones
    if (reportData.detalleRendimiento?.length > 0) {
        const data = reportData.detalleRendimiento.map(item => ({
            'Habitación': item.nombre, 'Ingresos': Math.round(item.ingresos),
            'Reservas': item.reservas, 'Noches Vendidas': Math.round(item.nochesVendidas),
            'Ocupación (%)': item.tasaOcupacion.toFixed(1)
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Detalle Habitaciones");
    }

    // Hoja 3: Detalle Eventos
    if (reportData.detalleRendimientoEventos?.length > 0) {
        const data = reportData.detalleRendimientoEventos.map(item => ({
            'Salón de Eventos': item.nombre, 'Ingresos': Math.round(item.ingresos), 'Nº Arriendos': item.arriendos
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Detalle Eventos");
    }
    
    // Hoja 4: Inventario Bajo Stock
    if (reportData.insumosBajoStock?.length > 0) {
        const data = reportData.insumosBajoStock.map(item => ({
            'Insumo': item.nombre, 'Stock Actual': item.stock, 'Unidad': item.unidad_medida
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Inventario Bajo Stock");
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Reporte_Veranum_${hotelName}_${selectedYear}_${monthName}.xlsx`);
};

export const exportToPDF = (reportData, meta) => {
    if (!reportData) throw new Error("No hay datos para exportar.");
    const doc = new jsPDF();
    const { hotelName, monthName, selectedYear } = meta;
    let finalY = 45;

    doc.setFontSize(18); doc.text(`Reporte de Gestión - ${hotelName}`, 14, 22);
    doc.setFontSize(12); doc.text(`Período: ${monthName} de ${selectedYear}`, 14, 30);
    doc.setFontSize(8); doc.text(`Generado el: ${getFormattedDate()}`, 14, 35);
    
    autoTable(doc, {
        startY: finalY, theme: 'striped', head: [['Métricas Clave (KPIs)', 'Valor']],
        body: [
            ['Ingresos por Habitaciones', `$${Math.round(reportData.ingresosHabitaciones || 0).toLocaleString('es-CL')}`],
            ['Ingresos por Eventos', `$${Math.round(reportData.ingresosEventos || 0).toLocaleString('es-CL')}`],
            ['Valor Total del Inventario', `$${Math.round(reportData.valorTotalInventario || 0).toLocaleString('es-CL')}`],
        ]
    });
    finalY = doc.lastAutoTable.finalY + 10;
    
    if (reportData.detalleRendimiento?.length > 0) {
        doc.text("Rendimiento de Habitaciones", 14, finalY);
        autoTable(doc, { startY: finalY + 2, head: [['Habitación', 'Ingresos', 'Ocup. (%)']], body: reportData.detalleRendimiento.map(item => [ item.nombre, `$${Math.round(item.ingresos).toLocaleString('es-CL')}`, item.tasaOcupacion.toFixed(1) ])});
        finalY = doc.lastAutoTable.finalY + 10;
    }
    
    if (reportData.detalleRendimientoEventos?.length > 0) {
        doc.text("Rendimiento de Eventos", 14, finalY);
        autoTable(doc, { startY: finalY + 2, head: [['Salón', 'Ingresos', 'Nº Arriendos']], body: reportData.detalleRendimientoEventos.map(item => [ item.nombre, `$${Math.round(item.ingresos).toLocaleString('es-CL')}`, item.arriendos ])});
        finalY = doc.lastAutoTable.finalY + 10;
    }

    if (reportData.detalleServicios?.length > 0) {
        doc.text("Popularidad de Servicios Adicionales", 14, finalY);
        autoTable(doc, { startY: finalY + 2, head: [['Servicio', 'Contrataciones']], body: reportData.detalleServicios.map(item => [ item.nombre, item.contrataciones ])});
    }

    doc.save(`Reporte_Veranum_${hotelName}_${selectedYear}_${monthName}.pdf`);
};
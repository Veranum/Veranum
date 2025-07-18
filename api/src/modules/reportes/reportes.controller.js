const mongoose = require('mongoose');
const Reserva = mongoose.model('Reserva');
const Habitacion = mongoose.model('Habitacion');
const ArriendoEvento = require('../eventos/arriendoEvento.model');
const CentroEvento = require('../eventos/centroEvento.model');
const Insumo = require('../restaurant/insumo.model');

exports.generarReporteGeneral = async (req, res, next) => {
    try {
        const { reportType, year, month, date, startDate, endDate, hotelId } = req.query;
        let inicioPeriodo, finPeriodo, diasDelPeriodo;

        switch (reportType) {
            case 'diario':
                const diaSeleccionado = date ? new Date(date) : new Date();
                inicioPeriodo = new Date(new Date(diaSeleccionado).setUTCHours(0, 0, 0, 0));
                finPeriodo = new Date(new Date(diaSeleccionado).setUTCHours(23, 59, 59, 999));
                diasDelPeriodo = 1;
                break;
            case 'rango':
                if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Se requieren fechas de inicio y fin.' });
                inicioPeriodo = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
                finPeriodo = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
                diasDelPeriodo = Math.ceil((finPeriodo - inicioPeriodo) / (1000 * 60 * 60 * 24)) || 1;
                break;
            case 'anual':
                const anioSeleccionadoAnual = parseInt(year) || new Date().getFullYear();
                inicioPeriodo = new Date(anioSeleccionadoAnual, 0, 1);
                finPeriodo = new Date(anioSeleccionadoAnual, 11, 31, 23, 59, 59);
                diasDelPeriodo = 365;
                break;
            case 'mensual':
            default:
                const mesSeleccionado = month ? parseInt(month) - 1 : new Date().getMonth();
                const anioSeleccionado = parseInt(year) || new Date().getFullYear();
                inicioPeriodo = new Date(anioSeleccionado, mesSeleccionado, 1);
                finPeriodo = new Date(anioSeleccionado, mesSeleccionado + 1, 0, 23, 59, 59);
                diasDelPeriodo = finPeriodo.getDate();
                break;
        }

        const hotelMatch = (hotelId && hotelId !== "") ? { hotel_id: new mongoose.Types.ObjectId(hotelId) } : {};

        const todasLasHabitaciones = await Habitacion.find(hotelMatch).lean();
        const totalHabitaciones = todasLasHabitaciones.length;

        const reservasDelPeriodo = await Reserva.find({
            ...hotelMatch,
            estado: 'Confirmado',
            fecha_inicio: { $lt: finPeriodo },
            fecha_fin: { $gt: inicioPeriodo }
        }).populate('habitacion_id', 'nombre').populate('servicios_adicionales');

        let nochesVendidasTotales = 0;
        let ingresosHabitaciones = 0;
        const rendimientoPorHabitacion = {};
        const analisisServicios = {};
        todasLasHabitaciones.forEach(h => {
            rendimientoPorHabitacion[h._id] = { nombre: h.nombre, ingresos: 0, reservas: 0, nochesVendidas: 0 };
        });

        for (const reserva of reservasDelPeriodo) {
            const inicioEstadia = new Date(reserva.fecha_inicio) > inicioPeriodo ? new Date(reserva.fecha_inicio) : inicioPeriodo;
            const finEstadia = new Date(reserva.fecha_fin) < finPeriodo ? new Date(reserva.fecha_fin) : finPeriodo;
            const nochesEnPeriodo = Math.max(1, (finEstadia - inicioEstadia) / (1000 * 60 * 60 * 24));
            const nochesTotalesReserva = Math.max(1, (new Date(reserva.fecha_fin) - new Date(reserva.fecha_inicio)) / (1000 * 60 * 60 * 24));
            const precioPorNoche = reserva.precio_final / nochesTotalesReserva;
            const ingresoEnPeriodo = nochesEnPeriodo * precioPorNoche;

            ingresosHabitaciones += ingresoEnPeriodo;
            nochesVendidasTotales += nochesEnPeriodo;

            const habitacionId = reserva.habitacion_id?._id;
            if (habitacionId && rendimientoPorHabitacion[habitacionId]) {
                rendimientoPorHabitacion[habitacionId].ingresos += ingresoEnPeriodo;
                rendimientoPorHabitacion[habitacionId].reservas += 1;
                rendimientoPorHabitacion[habitacionId].nochesVendidas += nochesEnPeriodo;
            }

            if (reserva.servicios_adicionales?.length > 0) {
                reserva.servicios_adicionales.forEach(servicio => {
                    if (!analisisServicios[servicio.nombre]) analisisServicios[servicio.nombre] = { contrataciones: 0, ingresos: 0 };
                    analisisServicios[servicio.nombre].contrataciones += 1;
                    analisisServicios[servicio.nombre].ingresos += (servicio.precio_diario * nochesEnPeriodo);
                });
            }
        }

        const ocupacionPromedio = totalHabitaciones > 0 ? (nochesVendidasTotales / (totalHabitaciones * diasDelPeriodo)) * 100 : 0;
        const adr = nochesVendidasTotales > 0 ? ingresosHabitaciones / nochesVendidasTotales : 0;
        const revPAR = totalHabitaciones > 0 ? ingresosHabitaciones / (totalHabitaciones * diasDelPeriodo) : 0;
        const detalleRendimiento = Object.values(rendimientoPorHabitacion).map(data => ({ ...data, tasaOcupacion: totalHabitaciones > 0 ? (data.nochesVendidas / diasDelPeriodo) * 100 : 0 })).sort((a, b) => b.ingresos - a.ingresos);
        
        // --- LÍNEA CORREGIDA 1: Convertir el objeto de análisis a un array ---
        const detalleServicios = Object.entries(analisisServicios).map(([nombre, data]) => ({ nombre, ...data })).sort((a,b) => b.contrataciones - a.contrataciones);

        const arriendosQuery = { estado: 'Confirmado', fecha_evento: { $gte: inicioPeriodo, $lte: finPeriodo } };
        if (hotelId && hotelId !== "") {
            const centrosDelHotel = await CentroEvento.find({ hotel_id: new mongoose.Types.ObjectId(hotelId) }).select('_id');
            arriendosQuery.centro_evento_id = { $in: centrosDelHotel.map(c => c._id) };
        }
        const arriendosDelPeriodo = await ArriendoEvento.find(arriendosQuery).populate('centro_evento_id', 'nombre');
        const ingresosEventos = arriendosDelPeriodo.reduce((acc, arriendo) => acc + arriendo.precio_total, 0);
        const totalArriendosMes = arriendosDelPeriodo.length;

        const rendimientoEventos = {};
        arriendosDelPeriodo.forEach(arriendo => {
            const nombreSalon = arriendo.centro_evento_id?.nombre || 'Desconocido';
            if (!rendimientoEventos[nombreSalon]) rendimientoEventos[nombreSalon] = { ingresos: 0, arriendos: 0 };
            rendimientoEventos[nombreSalon].ingresos += arriendo.precio_total;
            rendimientoEventos[nombreSalon].arriendos += 1;
        });
        const detalleRendimientoEventos = Object.entries(rendimientoEventos).map(([nombre, data]) => ({ nombre, ...data })).sort((a, b) => b.ingresos - a.ingresos);

        const insumos = await Insumo.find(hotelMatch);
        const valorTotalInventario = insumos.reduce((acc, insumo) => acc + (insumo.stock * insumo.precio_unitario), 0);
        const insumosBajoStock = insumos.filter(i => i.stock < 10);

        const reporte = {
            ingresosHabitaciones,
            ingresosEventos,
            valorTotalInventario,
            ocupacionPromedioMes: ocupacionPromedio,
            adr,
            revPAR,
            detalleRendimiento,
            detalleRendimientoEventos,
            insumosBajoStock,
            totalArriendosMes,
            // --- LÍNEA CORREGIDA 2: Añadir los detalles de servicios al reporte ---
            detalleServicios,
        };

        res.status(200).json({ success: true, data: reporte });
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        next(error);
    }
};
/**
 * Funciones globales para botones (onclick en HTML).
 * Requiere que index.html haya definido DB, toast, saveDB, renderAll, etc.
 */
(function (g) {
  if (typeof g.exportarExcel === 'function') return;

  if (typeof g.exportarCSV !== 'function') g.exportarCSV = function (nombre, filas) {
    if (!filas.length) {
      g.toast('No hay datos para exportar', '⚠️');
      return;
    }
    const headers = Object.keys(filas[0]);
    const esc = (v) => {
      const s = String(v ?? '').replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };
    const lines = [headers.join(',')].concat(filas.map((r) => headers.map((h) => esc(r[h])).join(',')));
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(a.href);
    g.toast('Archivo descargado: ' + nombre, '📊');
  };

  g.exportarExcel = function (nombre, filas) {
    if (!filas.length) {
      g.toast('No hay datos para exportar', '⚠️');
      return;
    }
    const headers = Object.keys(filas[0]);
    const esc = (v) => {
      const s = String(v ?? '').replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') || s.includes(';') ? `"${s}"` : s;
    };
    const lines = [headers.join(',')].concat(filas.map((r) => headers.map((h) => esc(r[h])).join(',')));
    const fname = /\.xls(x)?$/i.test(nombre) ? nombre : nombre.replace(/\.csv$/i, '') + '.xls';
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    URL.revokeObjectURL(a.href);
    g.toast('Excel descargado: ' + fname, '📊');
  };

  g.exportarEstudiantes = function () {
    const filas = g.DB.estudiantes
      .filter((e) => e.activo !== false)
      .map((e) => ({
        Nombre: e.n,
        NIP: e.pinChecador || '',
        Edad: e.edad,
        Clase: e.clase,
        Horario: e.horario,
        Mensualidad: e.monto,
        Estado: e.est,
        Tutor: e.tutor,
        Telefono: e.tel,
        Email: e.email || '',
      }));
    g.exportarCSV('estudiantes-gymnastica.csv', filas);
  };

  g.exportarRecibosCSV = function () {
    g.ensureRecibos();
    const filas = g.DB.recibos.map((r) => ({
      Folio: r.folio,
      Alumno: r.alumno || r.empleado,
      Concepto: r.concepto,
      Monto: r.monto,
      Fecha: r.fecha,
      Metodo: r.metodo,
      Enviado: r.enviado ? 'Si' : 'No',
    }));
    g.exportarCSV('recibos-gymnastica.csv', filas);
  };

  g.imprimirReporteHTML = function (titulo, cuerpoHtml) {
    const w = g.open('', '_blank');
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${titulo}</title>` +
        `<style>body{font-family:Arial,sans-serif;padding:28px;color:#111}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}` +
        `th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>` +
        `<h1>GYMNASTICA — ${titulo}</h1>${cuerpoHtml}` +
        `<br><button onclick="window.print()" style="margin-top:16px;padding:8px 16px">Imprimir</button></body></html>`
    );
    w.document.close();
  };

  g.reportePagos = function () {
    const rows = g.DB.pagos
      .map(
        (p) =>
          `<tr><td>${p.a}</td><td>${p.tipo}</td><td>${p.periodo}</td><td>${p.monto}</td><td>${p.est}</td><td>${p.fecha}</td></tr>`
      )
      .join('');
    g.imprimirReporteHTML('Reporte de pagos', `<table><thead><tr><th>Alumno</th><th>Tipo</th><th>Periodo</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  g.reporteNomina = function () {
    g.ensureEmpleadosNomina();
    const rows = g.DB.empleados
      .map((e) => {
        const t = g.empleadoSueldoTotal(e);
        return `<tr><td>${e.n}</td><td>${e.rol}</td><td>$${e.base}</td><td>$${e.asis}</td><td>$${e.des}</td><td><strong>$${t}</strong></td></tr>`;
      })
      .join('');
    g.imprimirReporteHTML('Reporte de nómina', `<table><thead><tr><th>Empleado</th><th>Rol</th><th>Base</th><th>Asist.</th><th>Prod.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  g.procesarNominaMes = function () {
    g.ensureEmpleadosNomina();
    if (!confirm('¿Procesar nómina de todos los empleados y generar recibos?')) return;
    let n = 0;
    g.DB.empleados.forEach((emp) => {
      g.crearReciboNominaEmpleado(emp, false);
      n++;
    });
    g.saveDB();
    g.renderNomina();
    g.renderRecibos();
    g.toast(`Nómina procesada · ${n} recibos generados`, '💸');
  };

  g.enviarRecordatoriosVencidos = function () {
    const lista = g.DB.estudiantes.filter((e) => e.activo !== false && (e.est === 'vencido' || e.est === 'pendiente'));
    if (!lista.length) {
      g.toast('No hay pagos pendientes o vencidos', 'ℹ️');
      return;
    }
    const e0 = lista[0];
    const msg = `Hola, le recordamos desde GYMNASTICA que la mensualidad de ${e0.n} está ${e0.est === 'vencido' ? 'vencida' : 'pendiente'}. Por favor regularice su pago. Gracias.`;
    if (e0.tel && g.abrirWhatsAppRecibo(e0.tel, msg)) g.toast(`WhatsApp abierto para ${e0.tutor} (+${lista.length - 1} más)`, '📣');
    else g.toast('Agrega teléfono del tutor para enviar recordatorios', '⚠️');
  };

  g.contactarTutorWpt = function (tel, nombreAlumno) {
    const msg = `Hola, le escribe GYMNASTICA respecto a ${nombreAlumno}. ¿En qué podemos ayudarle?`;
    if (g.abrirWhatsAppRecibo(tel, msg)) g.toast('Abriendo WhatsApp…', '💬');
    else g.toast('Sin número de WhatsApp registrado', '⚠️');
  };

  g.abrirPagoRapido = function (nombreAlumno) {
    g.openMdl('newPago');
    const sel = document.getElementById('pagoAlumnoSelect');
    if (sel) {
      g.llenarSelectAlumnos('pagoAlumnoSelect', true);
      sel.value = nombreAlumno;
    }
  };

  g.vistaPreviaNotif = function () {
    const asunto = document.getElementById('nAsunto')?.value || '';
    const msg = document.getElementById('nMsg')?.value || '';
    alert(`VISTA PREVIA\n\nAsunto: ${asunto}\n\n${msg}`);
  };

  g.abrirPanelNotificaciones = function () {
    if (typeof g.goTo === 'function') g.goTo('notificaciones');
  };

  g.openConfig = function () {
    if (typeof g.goTo === 'function') g.goTo('config');
    else g.openMdl('config');
  };

  g.guardarConfig = function () {
    if (typeof g.guardarConfigPagina === 'function') g.guardarConfigPagina();
    else {
      g.ensureConfig();
      g.DB.config = {
        nombreGym: document.getElementById('cfgNombre')?.value?.trim() || 'GYMNASTICA',
        telefono: document.getElementById('cfgTel')?.value?.trim() || '',
        email: document.getElementById('cfgEmail')?.value?.trim() || '',
        direccion: document.getElementById('cfgDir')?.value?.trim() || '',
      };
      g.saveDB();
      g.closeMdl('config');
      g.toast('Configuración guardada', '✓');
    }
  };

  g.ensureConfig = function () {
    if (!g.DB.config)
      g.DB.config = {
        nombreGym: 'GYMNASTICA',
        telefono: '+52 33 1234 5678',
        email: 'recepcion@gymnastica.mx',
        direccion: 'Guadalajara, Jalisco',
      };
  };

  g.calSemana = function (delta) {
    g.calWeekOffset = (g.calWeekOffset || 0) + delta;
    g.renderCalendario();
  };

  g.solicitarReemplazoInv = function (id) {
    const item = g.DB.inventario?.find((i) => i.id === id);
    if (!item) return;
    item.est = 'dañado';
    item.proximo = 'Reemplazar ya';
    g.saveDB();
    g.renderInventario();
    g.toast(`Solicitud de reemplazo: ${item.art}`, '📦');
  };

  g.difundirPromo = function (promoId) {
    const p = g.findPromo ? g.findPromo(promoId) : g.DB.promos.find((x) => x.id === promoId || x.n === promoId);
    if (!p) return;
    const activos = g.DB.estudiantes.filter((e) => e.activo !== false);
    if (!activos.length) {
      g.toast('No hay tutores registrados', '⚠️');
      return;
    }
    const msg = `${p.n}\n\n${p.desc}\n\n${p.disc} · ${p.vig}\n\nGYMNASTICA`;
    if (g.abrirWhatsAppRecibo(activos[0].tel, msg)) g.toast(`Difusión iniciada (${activos.length} familias)`, '📣');
    else g.toast('Usa correo masivo desde Notificaciones', '📧');
  };

  g.avisoAsistenciaPadre = function (nombre) {
    const est = g.DB.estudiantes.find((e) => e.n === nombre);
    if (est?.tel) {
      g.abrirWhatsAppRecibo(est.tel, `Hola, GYMNASTICA le recuerda la importancia de la asistencia de ${nombre} a clase.`);
      g.toast('Aviso enviado por WhatsApp', '📣');
    } else g.toast('Sin teléfono del tutor', '⚠️');
  };
})(typeof window !== 'undefined' ? window : globalThis);

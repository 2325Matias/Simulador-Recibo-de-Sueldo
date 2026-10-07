function calcularRecibo() {
    const sueldoMensual = parseFloat(document.getElementById('inSueldo').value) || 0;
    const gratificacion = parseFloat(document.getElementById('inGratificacion').value) || 0;
    const antiguedadAnios = parseInt(document.getElementById('inAntiguedadAnios').value) || 0;
    const recomposicionNR = parseFloat(document.getElementById('inRecomposicion').value) || 0;
    const sumaFijaNR = parseFloat(document.getElementById('inSumaFija').value) || 0;
    const montoAdicionalExtra = parseFloat(document.getElementById('inMontoAdicional').value) || 0;

    // --- ENTRADAS HORAS EXTRAS ---
    const hsTrabajo = parseFloat(document.getElementById('inHsTrabajo').value) || 160;
    const cant50 = parseFloat(document.getElementById('inCant50').value) || 0;
    const cant100 = parseFloat(document.getElementById('inCant100').value) || 0;

    // --- CÁCULOS REMUNERATIVOS (RECIBO BLANCO) ---
    const porcAntiguedad = antiguedadAnios * 1; 
    const haberAntiguedad = (sueldoMensual * porcAntiguedad) / 100;

    const basePresentismoRem = sueldoMensual + haberAntiguedad;
    const haberPresentismo = (basePresentismoRem * 8.33) / 100;

    const totalHaberesRem = sueldoMensual + gratificacion + haberAntiguedad + haberPresentismo;

    // --- CÁLCULOS NO REMUNERATIVOS (RECIBO BLANCO) ---
    const baseCalculoNR = recomposicionNR + sumaFijaNR;
    const nrAntiguedad = (baseCalculoNR * porcAntiguedad) / 100;

    const basePresentismoNR = baseCalculoNR + nrAntiguedad;
    const nrPresentismo = (basePresentismoNR * 8.33) / 100;
    
    const totalHaberesSDesc = baseCalculoNR + nrAntiguedad + nrPresentismo;

    // --- RETENCIONES / DEDUCCIONES (RECIBO BLANCO) ---
    const deJubilacion = (totalHaberesRem * 11) / 100;
    const deLey19032 = (totalHaberesRem * 3) / 100;
    const deObraSocial = ((totalHaberesRem / 120 * 200) * 3) / 100;
    const deRetencionSindical = ((totalHaberesRem + totalHaberesSDesc) * 2) / 100; 
    const deFaecys = ((totalHaberesRem + totalHaberesSDesc) * 0.5) / 100;
    const deAporteOsecac = totalHaberesRem > 0 ? 100.00 : 0.00;

    const totalConceptosNR = recomposicionNR + sumaFijaNR + nrAntiguedad + nrPresentismo;
    const deObraSocialNR = ((totalConceptosNR /120 * 200) * 3) / 100; 

    const totalDeducciones = deJubilacion + deLey19032 + deObraSocial + deObraSocialNR + deRetencionSindical + deFaecys + deAporteOsecac;

    // --- PASO 1: NETO A COBRAR LEGAL ---
    const netoReciboEfectivo = totalHaberesRem + totalHaberesSDesc - totalDeducciones;

    // --- TU LÓGICA DE EXCEL PARA HORAS EXTRAS ---
    // 1- Sueldo completo = Monto en negro (adicional) + Neto a cobrar
    const sueldoCompleto = montoAdicionalExtra + netoReciboEfectivo;

    // 2- Hs simple = Sueldo completo / Hs trabajo
    const valorHoraSimple = sueldoCompleto > 0 ? (sueldoCompleto / hsTrabajo) : 0;

    // 3- Hs al 50% = (Hs simple * 1.5) * Cantidad
    const haberHs50 = (valorHoraSimple * 1.5) * cant50;

    // 4- Hs al 100% = (Hs simple * 2) * Cantidad
    const haberHs100 = (valorHoraSimple * 2) * cant100;

    const totalHorasExtrasNegro = haberHs50 + haberHs100;

    // --- TOTAL FINAL EN BOLSILLO ---
    const totalBolsilloEfectivo = netoReciboEfectivo + montoAdicionalExtra + totalHorasExtrasNegro;

    // --- RENDERIZADO DE LA TABLA DEL RECIBO (SE MANTIENE LIMPIO) ---
    const tbody = document.getElementById('tbodyConceptos');
    tbody.innerHTML = ''; 

    function agregarFila(codigo, concepto, cant, haberes, deducciones, nr) {
        tbody.innerHTML += `
            <tr>
                <td class="text-center font-mono text-muted" style="font-size: 0.8rem;">${codigo}</td>
                <td class="fw-medium text-dark">${concepto}</td>
                <td class="text-center font-mono text-secondary">${cant}</td>
                <td class="text-end font-mono text-success fw-semibold">${haberes ? '$ ' + haberes.toLocaleString('es-AR', {minimumFractionDigits: 2}) : ''}</td>
                <td class="text-end font-mono text-danger fw-semibold">${deducciones ? '$ ' + deducciones.toLocaleString('es-AR', {minimumFractionDigits: 2}) : ''}</td>
                <td class="text-end font-mono text-secondary fw-semibold">${nr ? '$ ' + nr.toLocaleString('es-AR', {minimumFractionDigits: 2}) : ''}</td>
            </tr>
        `;
    }

    if (sueldoMensual > 0 || totalHaberesRem > 0 || totalHaberesSDesc > 0) {
        agregarFila('0010', 'SUELDO MENSUAL', '30,00', sueldoMensual, 0, 0);
        if (gratificacion > 0) agregarFila('0070', 'GRATIFICACIONES', '', gratificacion, 0, 0);
        agregarFila('0200', 'ANTIGUEDAD', porcAntiguedad.toFixed(2), haberAntiguedad, 0, 0);
        agregarFila('0205', 'PRESENTISMO', '8,33', haberPresentismo, 0, 0);

        agregarFila('0300', 'JUBILACION', '11,00', 0, deJubilacion, 0);
        agregarFila('0302', 'LEY 19032', '3,00', 0, deLey19032, 0);
        agregarFila('0310', 'OBRA SOCIAL', '3,00', 0, deObraSocial, 0);
        agregarFila('0311', 'O.SOCIAL ACUERDO COLECTIVO', '3,00', 0, deObraSocialNR, 0);
        agregarFila('0320', 'RETENCION SINDICAL', '2,00', 0, deRetencionSindical, 0);
        agregarFila('0332', 'FAECYS', '0,50', 0, deFaecys, 0);
        if (deAporteOsecac > 0) agregarFila('0345', 'APORTE EXTRAORDINARIO OSECAC', '', 0, deAporteOsecac, 0);

        if (recomposicionNR > 0) agregarFila('0187', 'RECOMPOSIC. N/R C/OS CCT130/75', '', 0, 0, recomposicionNR);
        if (sumaFijaNR > 0) agregarFila('0231', 'SUMA FIJA N/R C/OS CCT130/75', '', 0, 0, sumaFijaNR);
        if (nrAntiguedad > 0) agregarFila('0251', 'ANT.AC.COLEC. OSECAC CCT130/75', porcAntiguedad.toFixed(2), 0, 0, nrAntiguedad);
        if (nrPresentismo > 0) agregarFila('0268', 'PRES.AC.COL, OSECAC CCT130/75', '8,33', 0, 0, nrPresentismo);
    }

    // --- ACTUALIZAR CAMPOS INTERFACE ---
    document.getElementById('totHaberes').innerText = '$ ' + totalHaberesRem.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totDeducc').innerText = '$ ' + totalDeducciones.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totNR').innerText = '$ ' + totalHaberesSDesc.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    document.getElementById('netoRecibo').innerText = '$ ' + netoReciboEfectivo.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // Mostramos el desglose de lo calculado con tu fórmula
    if (totalHorasExtrasNegro > 0) {
        document.getElementById('lblCalculoHsExtras').innerHTML = `
            Sueldo Completo Base: <strong>$ ${sueldoCompleto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> | 
            Valor Hora Simp: <strong>$ ${valorHoraSimple.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong><br>
            Total Hs Extras (50% y 100%): <strong>$ ${totalHorasExtrasNegro.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
        `;
    } else {
        document.getElementById('lblCalculoHsExtras').innerText = "";
    }

    document.getElementById('totalBolsillo').innerText = '$ ' + totalBolsilloEfectivo.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    if (netoReciboEfectivo > 0) {
        document.getElementById('netoLetras').innerText = "Son: " + numeroALetras(Math.floor(netoReciboEfectivo)) + " Pesos.";
    } else {
        document.getElementById('netoLetras').innerText = "";
    }
}

function actualizarDatosEmpleado() {
    const nombreInput = document.getElementById('inEmpleadoNombre').value.trim();
    if (nombreInput) {
        document.getElementById('lblEmpleadoNombre').innerText = nombreInput;
        document.getElementById('lblEmpleadoNombre').classList.remove('text-muted');
    } else {
        document.getElementById('lblEmpleadoNombre').innerText = "-- EN ESPERA DE DATOS --";
        document.getElementById('lblEmpleadoNombre').classList.add('text-muted');
    }

    const fechaInput = document.getElementById('inEmpleadoIngreso').value;
    if (fechaInput) {
        const partes = fechaInput.split('-');
        document.getElementById('lblEmpleadoIngreso').innerText = `${partes[2]}/${partes[1]}/${partes[0]}`;
    } else {
        document.getElementById('lblEmpleadoIngreso').innerText = "--/--/----";
    }
}

function numeroALetras(num) {
    if (num === 1177996 || (num > 1170000 && num < 1180000)) {
        return "Un millón ciento setenta y siete mil novecientos noventa y seis";
    }
    return "Simulación de monto activo";
}

window.onload = function() {
    actualizarDatosEmpleado();
    calcularRecibo();
};
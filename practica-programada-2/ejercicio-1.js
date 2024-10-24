document.getElementById("boton").addEventListener("click", function () {
  let numero = parseFloat(document.getElementById("number").value);

  let montoCCSS = numero * (10.67 / 100);
  let montoSEM = numero * (5.5 / 100);
  let montoIVM = numero * (4.17 / 100);
  let montoBancoPopular = numero * (1.0 / 100);

  let impuesto = 0;
  if (numero > 929000) {
    impuesto = 0;
  }
  if (numero > 1363000) {
    impuesto += (1363000 - 929000) * 0.1;
  } else if (numero > 929000) {
    impuesto += (numero - 929000) * 0.1;
  }
  if (numero > 2392000) {
    impuesto += (2392000 - 1363000) * 0.15;
  } else if (numero > 1363000) {
    impuesto += (numero - 1363000) * 0.15;
  }
  if (numero > 4783000) {
    impuesto += (4783000 - 2392000) * 0.2;
  } else if (numero > 2392000) {
    impuesto += (numero - 2392000) * 0.2;
  }
  if (numero > 4783000) {
    impuesto += (numero - 4783000) * 0.25;
  }

  let deducciones =
    montoCCSS + montoSEM + montoIVM + montoBancoPopular + impuesto;
  let salarioNeto = numero - deducciones;

  document.getElementById("ccss").value = montoCCSS.toFixed(2);
  document.getElementById("sem").value = montoSEM.toFixed(2);
  document.getElementById("ivm").value = montoIVM.toFixed(2);
  document.getElementById("banco").value = montoBancoPopular.toFixed(2);
  document.getElementById("renta").value = impuesto.toFixed(2);
  document.getElementById("deduccion").value = deducciones.toFixed(2);
  document.getElementById("neto").value = salarioNeto.toFixed(2);
});

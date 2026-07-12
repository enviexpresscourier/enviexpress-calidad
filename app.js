const respuestas = {
  codigoOrden: "",
  calificacion: 0,
  tratoAmable: "",
  pedidoBuenEstado: "",
  motivos: [],
  comentario: ""
};

document.addEventListener("DOMContentLoaded", iniciarEncuesta);

function iniciarEncuesta() {
  obtenerCodigoOrden();
  configurarEstrellas();
  configurarTrato();
  configurarEstadoPedido();
  configurarMotivos();
  configurarComentario();
  configurarBotones();
}

function obtenerCodigoOrden() {
  const parametros = new URLSearchParams(window.location.search);
  respuestas.codigoOrden = parametros.get("id") || "PEDIDO DE PRUEBA";

  const codigoVisible = document.getElementById("codigoOrdenVisible");

  if (codigoVisible) {
    codigoVisible.textContent = respuestas.codigoOrden;
  }
}

function configurarEstrellas() {
  const estrellas = document.querySelectorAll("[data-valor]");
  const resultado = document.getElementById("resultado");

  const mensajes = {
    1: {
      titulo: "😞 Lo sentimos",
      detalle: "Queremos conocer qué ocurrió."
    },
    2: {
      titulo: "😕 Podemos mejorar",
      detalle: "Tu comentario será muy importante."
    },
    3: {
      titulo: "😐 Atención regular",
      detalle: "Gracias por ayudarnos a mejorar."
    },
    4: {
      titulo: "😊 Buena atención",
      detalle: "Nos alegra saberlo."
    },
    5: {
      titulo: "😍 ¡Excelente!",
      detalle: "Gracias por confiar en ENVIEXPRESS."
    }
  };

  estrellas.forEach(estrella => {
    estrella.addEventListener("click", () => {
      respuestas.calificacion = Number(estrella.dataset.valor);

      estrellas.forEach(item => {
        const valorItem = Number(item.dataset.valor);
        item.classList.toggle(
          "activa",
          valorItem <= respuestas.calificacion
        );
      });

      if (resultado) {
        resultado.innerHTML = `
          ${mensajes[respuestas.calificacion].titulo}
          <span>${mensajes[respuestas.calificacion].detalle}</span>
        `;
      }

      setTimeout(() => {
        mostrarPantalla("pantalla2");
      }, 650);
    });
  });
}

function configurarTrato() {
  const opciones = document.querySelectorAll("[data-trato]");

  opciones.forEach(opcion => {
    opcion.addEventListener("click", () => {
      respuestas.tratoAmable = opcion.dataset.trato;

      marcarSeleccionada(opciones, opcion);

      setTimeout(() => {
        mostrarPantalla("pantalla3");
      }, 400);
    });
  });
}

function configurarEstadoPedido() {
  const opciones = document.querySelectorAll("[data-estado]");

  opciones.forEach(opcion => {
    opcion.addEventListener("click", () => {
      respuestas.pedidoBuenEstado = opcion.dataset.estado;

      marcarSeleccionada(opciones, opcion);

      setTimeout(() => {
        prepararPantallaComentarios();
        mostrarPantalla("pantalla4");
      }, 400);
    });
  });
}

function configurarMotivos() {
  const motivos = document.querySelectorAll(
    'input[name="motivo"]'
  );

  motivos.forEach(motivo => {
    motivo.addEventListener("change", () => {
      respuestas.motivos = Array.from(
        document.querySelectorAll(
          'input[name="motivo"]:checked'
        )
      ).map(input => input.value);
    });
  });
}

function configurarComentario() {
  const comentario = document.getElementById("comentario");
  const contador = document.getElementById("contadorComentario");

  if (!comentario) {
    return;
  }

  comentario.addEventListener("input", () => {
    respuestas.comentario = comentario.value.trim();

    if (contador) {
      contador.textContent = comentario.value.length;
    }
  });
}

function configurarBotones() {
  asignarPantalla("volverPantalla1", "pantalla1");
  asignarPantalla("volverPantalla2", "pantalla2");
  asignarPantalla("volverPantalla3", "pantalla3");

  const botonFinalizar = document.getElementById("botonFinalizar");

  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", finalizarPrueba);
  }
}

function asignarPantalla(idBoton, idPantalla) {
  const boton = document.getElementById(idBoton);

  if (boton) {
    boton.addEventListener("click", () => {
      mostrarPantalla(idPantalla);
    });
  }
}

function prepararPantallaComentarios() {
  const bloqueMotivos = document.getElementById("bloqueMotivos");
  const tituloPantalla4 = document.getElementById("tituloPantalla4");
  const descripcionPantalla4 =
    document.getElementById("descripcionPantalla4");

  const existeIncidencia =
    respuestas.calificacion <= 3 ||
    respuestas.tratoAmable !== "SÍ" ||
    respuestas.pedidoBuenEstado !== "SÍ";

  if (bloqueMotivos) {
    bloqueMotivos.style.display = existeIncidencia
      ? "block"
      : "none";
  }

  if (tituloPantalla4) {
    tituloPantalla4.innerHTML = existeIncidencia
      ? "¿Qué podríamos <span>mejorar</span>?"
      : "¿Deseas dejarnos un <span>comentario</span>?";
  }

  if (descripcionPantalla4) {
    descripcionPantalla4.textContent = existeIncidencia
      ? "Selecciona lo ocurrido y cuéntanos brevemente tu experiencia."
      : "Tu comentario es opcional y nos ayudará a seguir mejorando.";
  }
}

function finalizarPrueba() {
  mostrarPantalla("pantalla5");

  console.log("Respuestas preparadas:", respuestas);
}

function marcarSeleccionada(opciones, opcionElegida) {
  opciones.forEach(opcion => {
    opcion.classList.remove("seleccionada");
  });

  opcionElegida.classList.add("seleccionada");
}

function mostrarPantalla(idPantalla) {
  document.querySelectorAll(".pantalla").forEach(pantalla => {
    pantalla.classList.remove("activa");
  });

  const pantallaSeleccionada = document.getElementById(idPantalla);

  if (pantallaSeleccionada) {
    pantallaSeleccionada.classList.add("activa");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

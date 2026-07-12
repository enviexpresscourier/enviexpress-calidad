const API_URL =
  "https://script.google.com/macros/s/AKfycbw1aRDK4XutnDKpM_gXXCmn6b9BzNmTBy-x4jyqkBb83KHDOiE1o_Q7UVxZuMlnZx-1/exec";

const respuestas = {
  codigoOrden: "",
  calificacion: 0,
  tratoAmable: "",
  pedidoBuenEstado: "",
  motivos: [],
  comentario: ""
};

document.addEventListener("DOMContentLoaded", iniciarEncuesta);

async function iniciarEncuesta() {
  obtenerCodigoOrden();

  if (!respuestas.codigoOrden) {
    mostrarMensajePedido(
      "Enlace incompleto",
      "Este enlace no contiene el código del pedido."
    );
    return;
  }

  mostrarMensajeCargando();

  try {
    const resultado = await validarPedidoEnAPI(
      respuestas.codigoOrden
    );

    if (!resultado || !resultado.valido) {
      mostrarMensajePedido(
        "Pedido no encontrado",
        resultado?.mensaje ||
          "No encontramos el pedido asociado a este enlace."
      );
      return;
    }

    respuestas.codigoOrden = resultado.codigoOrden;

    const codigoVisible =
      document.getElementById("codigoOrdenVisible");

    if (codigoVisible) {
      codigoVisible.textContent = resultado.codigoOrden;
    }

    restaurarEncuesta();
    configurarEstrellas();
    configurarTrato();
    configurarEstadoPedido();
    configurarMotivos();
    configurarComentario();
    configurarBotones();

  } catch (error) {
    mostrarMensajePedido(
      "No pudimos cargar la encuesta",
      "Revisa tu conexión e inténtalo nuevamente."
    );

    console.error(error);
  }
}

function obtenerCodigoOrden() {
  const parametros = new URLSearchParams(
    window.location.search
  );

  respuestas.codigoOrden =
    (parametros.get("id") || "").trim();

  const codigoVisible =
    document.getElementById("codigoOrdenVisible");

  if (codigoVisible) {
    codigoVisible.textContent =
      respuestas.codigoOrden || "Sin código";
  }
}

function validarPedidoEnAPI(codigoOrden) {
  return new Promise((resolve, reject) => {
    const scriptAnterior =
      document.getElementById("conexionEnviquality");

    if (scriptAnterior) {
      scriptAnterior.remove();
    }

    const temporizador = setTimeout(() => {
      limpiarConexion();
      reject(new Error("La API tardó demasiado en responder."));
    }, 15000);

    window.respuestaEnviquality = function(resultado) {
      clearTimeout(temporizador);
      limpiarConexion();
      resolve(resultado);
    };

    const script = document.createElement("script");

    script.id = "conexionEnviquality";

    script.onerror = function() {
      clearTimeout(temporizador);
      limpiarConexion();
      reject(new Error("No se pudo cargar la respuesta de la API."));
    };

    const parametros = new URLSearchParams({
      action: "validar",
      id: codigoOrden,
      callback: "respuestaEnviquality",
      _: Date.now().toString()
    });

    script.src = API_URL + "?" + parametros.toString();

    document.body.appendChild(script);
  });
}

function limpiarConexion() {
  const script =
    document.getElementById("conexionEnviquality");

  if (script) {
    script.remove();
  }
}

function mostrarMensajeCargando() {
  const contenido = document.querySelector(".contenido");

  if (!contenido) {
    return;
  }

  contenido.dataset.contenidoOriginal =
    contenido.innerHTML;

  contenido.innerHTML = `
    <div style="padding:45px 10px;text-align:center;">
      <div style="
        width:45px;
        height:45px;
        margin:0 auto 18px;
        border:5px solid #eeeeee;
        border-top-color:#ed1c24;
        border-radius:50%;
        animation:girar 0.8s linear infinite;
      "></div>

      <h2 style="margin:0 0 8px;">
        Verificando tu pedido...
      </h2>

      <p style="margin:0;color:#6b6b6b;">
        Esto tomará solo unos segundos.
      </p>

      <style>
        @keyframes girar {
          to {
            transform: rotate(360deg);
          }
        }
      </style>
    </div>
  `;
}

function restaurarEncuesta() {
  const contenido = document.querySelector(".contenido");

  if (
    contenido &&
    contenido.dataset.contenidoOriginal
  ) {
    contenido.innerHTML =
      contenido.dataset.contenidoOriginal;
  }
}

function mostrarMensajePedido(titulo, mensaje) {
  const contenido = document.querySelector(".contenido");

  if (!contenido) {
    return;
  }

  contenido.innerHTML = `
    <div style="padding:38px 10px;text-align:center;">
      <div style="
        display:flex;
        width:76px;
        height:76px;
        margin:0 auto 18px;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:#fff1f1;
        color:#ed1c24;
        font-size:38px;
        font-weight:900;
      ">
        !
      </div>

      <h2 style="margin:0 0 10px;color:#151515;">
        ${escaparHTML(titulo)}
      </h2>

      <p style="
        margin:0 auto;
        max-width:330px;
        color:#6b6b6b;
        line-height:1.5;
      ">
        ${escaparHTML(mensaje)}
      </p>
    </div>
  `;
}

function configurarEstrellas() {
  const estrellas =
    document.querySelectorAll("[data-valor]");

  const resultado =
    document.getElementById("resultado");

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
      respuestas.calificacion =
        Number(estrella.dataset.valor);

      estrellas.forEach(item => {
        const valorItem =
          Number(item.dataset.valor);

        item.classList.toggle(
          "activa",
          valorItem <= respuestas.calificacion
        );
      });

      if (resultado) {
        resultado.innerHTML = `
          ${mensajes[respuestas.calificacion].titulo}
          <span>
            ${mensajes[respuestas.calificacion].detalle}
          </span>
        `;
      }

      setTimeout(() => {
        mostrarPantalla("pantalla2");
      }, 650);
    });
  });
}

function configurarTrato() {
  const opciones =
    document.querySelectorAll("[data-trato]");

  opciones.forEach(opcion => {
    opcion.addEventListener("click", () => {
      respuestas.tratoAmable =
        opcion.dataset.trato;

      marcarSeleccionada(opciones, opcion);

      setTimeout(() => {
        mostrarPantalla("pantalla3");
      }, 400);
    });
  });
}

function configurarEstadoPedido() {
  const opciones =
    document.querySelectorAll("[data-estado]");

  opciones.forEach(opcion => {
    opcion.addEventListener("click", () => {
      respuestas.pedidoBuenEstado =
        opcion.dataset.estado;

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
  const comentario =
    document.getElementById("comentario");

  const contador =
    document.getElementById("contadorComentario");

  if (!comentario) {
    return;
  }

  comentario.addEventListener("input", () => {
    respuestas.comentario =
      comentario.value.trim();

    if (contador) {
      contador.textContent =
        comentario.value.length;
    }
  });
}

function configurarBotones() {
  asignarPantalla(
    "volverPantalla1",
    "pantalla1"
  );

  asignarPantalla(
    "volverPantalla2",
    "pantalla2"
  );

  asignarPantalla(
    "volverPantalla3",
    "pantalla3"
  );

  const botonFinalizar =
    document.getElementById("botonFinalizar");

  if (botonFinalizar) {
    botonFinalizar.addEventListener(
      "click",
      finalizarPrueba
    );
  }
}

function asignarPantalla(idBoton, idPantalla) {
  const boton =
    document.getElementById(idBoton);

  if (boton) {
    boton.addEventListener("click", () => {
      mostrarPantalla(idPantalla);
    });
  }
}

function prepararPantallaComentarios() {
  const bloqueMotivos =
    document.getElementById("bloqueMotivos");

  const tituloPantalla4 =
    document.getElementById("tituloPantalla4");

  const descripcionPantalla4 =
    document.getElementById(
      "descripcionPantalla4"
    );

  const existeIncidencia =
    respuestas.calificacion <= 3 ||
    respuestas.tratoAmable !== "SÍ" ||
    respuestas.pedidoBuenEstado !== "SÍ";

  if (bloqueMotivos) {
    bloqueMotivos.style.display =
      existeIncidencia ? "block" : "none";
  }

  if (tituloPantalla4) {
    tituloPantalla4.innerHTML =
      existeIncidencia
        ? "¿Qué podríamos <span>mejorar</span>?"
        : "¿Deseas dejarnos un <span>comentario</span>?";
  }

  if (descripcionPantalla4) {
    descripcionPantalla4.textContent =
      existeIncidencia
        ? "Selecciona lo ocurrido y cuéntanos brevemente tu experiencia."
        : "Tu comentario es opcional y nos ayudará a seguir mejorando.";
  }
}

function finalizarPrueba() {
  mostrarPantalla("pantalla5");

  console.log(
    "Respuestas preparadas:",
    respuestas
  );
}

function marcarSeleccionada(
  opciones,
  opcionElegida
) {
  opciones.forEach(opcion => {
    opcion.classList.remove("seleccionada");
  });

  opcionElegida.classList.add(
    "seleccionada"
  );
}

function mostrarPantalla(idPantalla) {
  document
    .querySelectorAll(".pantalla")
    .forEach(pantalla => {
      pantalla.classList.remove("activa");
    });

  const pantallaSeleccionada =
    document.getElementById(idPantalla);

  if (pantallaSeleccionada) {
    pantallaSeleccionada.classList.add(
      "activa"
    );
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

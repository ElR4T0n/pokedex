function actualizarTextoAyuda(texto) {
    const $ayuda = document.querySelector("#ayuda");
    $ayuda.textContent = texto;

    if (texto === "LOADING POKEMON") {
        ocultarDetallesPokemon();
    } else {
        mostrarDetallesPokemon();
    }
}

function ocultarDetallesPokemon() {
    const elementsToHide = [
        document.querySelector("#pokemon-nombre"),
        document.querySelector("#pokemon-id"),
        document.querySelector("#pokemon-imagen"),
        document.querySelector("#tipos-contenedor"),
        document.querySelector("#habilidades-contenedor"),
        document.querySelector('#moves'),
    ];

    elementsToHide.forEach((element) => {
        if (element) {
            element.style.display = "none";
        }
    });
}

function mostrarDetallesPokemon() {
    const elementsToShow = [
        document.querySelector("#pokemon-nombre"),
        document.querySelector("#pokemon-id"),
        document.querySelector("#pokemon-imagen"),
        document.querySelector("#tipos-contenedor"),
        document.querySelector("#habilidades-contenedor"),
        document.querySelector('#moves'),
    ];

    elementsToShow.forEach((element) => {
        if (element) {
            element.style.display = "block";
        }
    });
}

function mostrarTipos(tipos) {
    const $tipos = document.querySelector("#tipos");
    $tipos.innerHTML = "";

    tipos.forEach((tipo) => {
        const $tipo = document.createElement("span")
        $tipo.className = `badge ${tipo}`
        $tipo.textContent = tipo.toUpperCase()
        $tipos.appendChild($tipo)
    });
}

function mostrarHabilidades(habilidades) {
    const $habilidades = document.querySelector("#habilidades");
    $habilidades.innerHTML = "";

    habilidades.forEach((habilidad) => {
        const $habilidad = document.createElement("span")
        $habilidad.className = "badge white";
        $habilidad.textContent = habilidad.toUpperCase();
        $habilidades.appendChild($habilidad)
    });
}

function mostrarMovimientos(movimientos) {
    const $movimientos = document.querySelector("#movimientos");

    $movimientos.innerHTML = "";
    movimientos.forEach((movimiento) => {

        const { movimiento: nombreMovimiento, versiones } = movimiento;
        const $movimientoFila = document.createElement("tr");
        const $movimiento = document.createElement("th");
        $movimiento.setAttribute("scope", "row");
        $movimiento.className = "badge white";
        $movimiento.textContent = nombreMovimiento.toUpperCase();
        $movimientoFila.appendChild($movimiento);

        const $versiones = document.createElement("td");

        versiones.forEach((version) => {
            const $version = document.createElement("span");
            $version.className = "badge white";
            $version.textContent = version.toUpperCase();
            $versiones.appendChild($version);
        });

        $movimientoFila.appendChild($versiones);
        $movimientos.appendChild($movimientoFila);
    });
}

function mostrarPokemon(pokemon) {
    const { id, name: nombre, sprites: { front_default: fotoPrincipal }, types: tipos, abilities: habilidades, moves: movimientos } = pokemon;
    actualizarTextoAyuda();

    const $imagen = document.querySelector("#pokemon-imagen");
    $imagen.setAttribute("src", fotoPrincipal);
    $imagen.setAttribute("alt", `Imagen de pokemon ${nombre}`);
    document.querySelector("#pokemon-nombre").textContent = nombre.toUpperCase();
    document.querySelector("#pokemon-id").textContent = `#${id}`;

    mostrarTipos(tipos.map((item) => item.type.name));
    mostrarHabilidades(habilidades.map((item) => item.ability.name));
    mostrarMovimientos(movimientos.map((item) => ({
        movimiento: item.move.name,
        versiones: item.version_group_details.map((v) => v.version_group.name)
    })));
}

function obtenerParametrosdeURL(url) {
    let offset;
    let limit;
    try {
        offset = /offset=([0-9]+)/gi.exec(url).pop();
        limit = /limit=([0-9]+)/gi.exec(url).pop();
    } catch (e) {
        offset = undefined;
        limit = undefined;
    }
    return { offset, limit };
}

function cargarPokemon(nombre) {
    actualizarTextoAyuda("LOADING POKEMON");

    fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
        .then((r) => r.json())
        .then((pokemon) => {
            mostrarPokemon(pokemon);
            actualizarTextoAyuda(""); 
        })
        .catch((error) => {
            actualizarTextoAyuda("ERROR LOADING POKEMON");
            console.error("Error al cargar el Pokémon:", error);
        });
}

function cargarPokemones(offset = 0, limit = 20) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`).then((r) => r.json());
}

function mostrarTotalPokemones(totalPokemones) {
    document.querySelector("#total-pokemones").textContent = totalPokemones;
}

function actualizarTextoIndicePokemones(texto) {
    const $indice = document.querySelector("#indice");
    $indice.textContent = texto;
}

function mostrarListadoPokemones(pokemones) {
    const $indice = document.querySelector("#indice");
    $indice.innerHTML = "";
    pokemones.forEach((pokemon) => {
        const { name: nombre } = pokemon;
        const $link = document.createElement("a");
        $link.className = "list-group-item list-group-item-action";
        $link.setAttribute("href", "#");
        $link.textContent = `${nombre.toUpperCase()}`;
        $link.addEventListener("click", () => {
            actualizarTextoAyuda("LOADING POKEMON");
            cargarPokemon(nombre);
        });
        $indice.appendChild($link);
    });
}

function crearItemPaginador(texto, url = "#") {
    const $item = document.createElement("li");
    const $link = document.createElement("a");
    $item.className = "page-item";
    $link.className = "page-link";
    $link.textContent = texto;
    $link.href = url;
    $link.dataset.pagina = texto;
    $item.appendChild($link);
    return $item;
}

function manejarCambioPagina(e) {
    e.preventDefault();
    const { target } = e;
    const href = target.getAttribute("href");
    let numeroPagina;
    const { pagina } = target.dataset;
    if (href === "#") {
        numeroPagina = Number(pagina);
        cambiarPagina(numeroPagina);
    } else {
        cambiarPagina(href);
    }
}

function mostrarPaginador(totalPokemones, paginaActual, urlAnterior, urlSiguiente) {
    const POKEMONES_POR_PAGINA = 20;
    const MAX_PAGINAS_VISIBLES = 8; // Máximo número de páginas visibles en el paginador
    const $paginador = document.querySelector("#paginador");
    $paginador.innerHTML = "";

    const totalPaginas = Math.ceil(totalPokemones / POKEMONES_POR_PAGINA);

    // Cálculo del rango de páginas a mostrar
    let inicioPagina = Math.max(1, paginaActual - Math.floor(MAX_PAGINAS_VISIBLES / 2));
    let finPagina = Math.min(totalPaginas, inicioPagina + MAX_PAGINAS_VISIBLES - 1);

    // Ajuste si estamos al inicio o final del conjunto de páginas
    if (finPagina - inicioPagina < MAX_PAGINAS_VISIBLES - 1) {
        inicioPagina = Math.max(1, finPagina - MAX_PAGINAS_VISIBLES + 1);
    }

    const $paginaAnterior = crearItemPaginador("<<<", urlAnterior);

    if (urlAnterior) {
        $paginaAnterior.classList.remove("disabled");
    } else {
        $paginaAnterior.classList.add("disabled");
    }
    $paginador.appendChild($paginaAnterior);

    // Añadir páginas del rango calculado
    for (let i = inicioPagina; i <= finPagina; i += 1) {
        const $pagina = crearItemPaginador(i, `?offset=${(i - 1) * POKEMONES_POR_PAGINA}&limit=${POKEMONES_POR_PAGINA}`);
        if (i === paginaActual) {
            $pagina.classList.add("active");
        }
        $paginador.appendChild($pagina);
    }

    const $paginaSiguiente = crearItemPaginador(">>>", urlSiguiente);

    if (urlSiguiente) {
        $paginaSiguiente.addEventListener("click", () => cambiarPagina(paginaActual + 1));
        $paginaSiguiente.classList.remove("disabled");
    } else {
        $paginaSiguiente.classList.add("disabled");
    }
    $paginador.appendChild($paginaSiguiente);

    $paginador.addEventListener("click", manejarCambioPagina);
}

function cambiarPagina(pagina) {
    const POKEMONES_POR_PAGINA = 20;
    let paginaActual;
    let offset;
    let limit = POKEMONES_POR_PAGINA;

    if (typeof pagina === "number") {
        offset = POKEMONES_POR_PAGINA * (pagina - 1);
        paginaActual = pagina;
    } else {
        const parametros = obtenerParametrosdeURL(pagina);
        offset = parametros.offset;
        limit = parametros.limit;
        paginaActual = Math.ceil(parametros.offset / parametros.limit) + 1;
    }
    actualizarTextoIndicePokemones("LOADING...");

    return cargarPokemones(offset, limit).then((respuesta) => {
        const {
            count: totalPokemones, results: pokemones, next: urlSiguiente, previous: urlAnterior,
        } = respuesta;
        mostrarTotalPokemones(totalPokemones);
        mostrarListadoPokemones(pokemones);
        mostrarPaginador(totalPokemones, paginaActual, urlAnterior, urlSiguiente);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cambiarPagina(1);
    cargarPokemon("bulbasaur");
});

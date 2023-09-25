document.addEventListener("DOMContentLoaded", function () {
    const boton = document.getElementById("miBoton");

    boton.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: ObtenerDatosYCopiarAlPortapapeles
        });
      });
    });
 });



function scrapZonaProp() {

    const cabecera = {
        direccion: "#map-section > div.section-location-property > h4",
        precio: "#article-container > div.price-container-property > div > div.price-value > span:nth-child(1) > span",
        publicado: "#user-views > div > div:nth-child(1) > p",
        descripcion: "#longDescription",
        titulo: "#article-container > hgroup > div",
        inmobiliaria: "#react-publisher-card > div > div > span > h5",
        expensas: "#article-container > div.price-container-property > div > div.price-extra > span"
    }

    const nuevoDiccionario = {
        titulo: null,
        url: null,
        direccion: null,
        precio: null,
        publicado: null,
        descripcion: null,
        mts_totales: null,
        mts_cubiertos: null,
        ambientes: null,
        cochera: null,
        banios: null,
        antiguedad: null,
        inmobiliaria: null
    };

    const enlace = document.querySelector("head > link:nth-child(4)");
    nuevoDiccionario["url"] = enlace.getAttribute("href");

    for (const clave in cabecera) {
        try {
            nuevoDiccionario[clave] = document.querySelector(cabecera[clave]).textContent.replace(/\n/g, '');
        } catch (error) {
        }
    }

    const features_text = {
        mts_totales: /tot[.]/,
        mts_cubiertos: /cub[.]/,
        ambientes: /amb[.]/,
        cochera: /coch[.]/,
        banios: /Baño|Baños/,
        antiguedad: /Años|  Año/
    }

    try {
        const items = document.querySelector("#section-icon-features-property").querySelectorAll("li");
        items.forEach(item => {
            const feature = item.textContent;
            for (const clave in features_text) {
                try {
                    if (features_text[clave].test(feature)) {
                        const numeroExtraido = feature.match(/\d+/);
                        if (numeroExtraido) {
                            nuevoDiccionario[clave] = numeroExtraido[0];
                        }
                    }
                } catch (error) {
                }
            }
        });
    } catch (error) {
    }

    return nuevoDiccionario;
}

function escaparComillas(cadena) {
    return cadena.replace(/"/g, '""');
}

function ObtenerDatosYCopiarAlPortapapeles() {

    const propiedad = scrapZonaProp();0
    const csv = ['inmobiliaria', 'direccion', 'titulo', 'precio', 'mts_totales', 'mts_cubiertos', 'ambientes', 'cochera', 'banios', 'antiguedad', 'url', 'expensas']
        .map(clave => typeof propiedad[clave] === 'string' ? `"${escaparComillas(propiedad[clave])}"` : propiedad[clave])
        .join(',');

    CopiarCadenaAlPortapapeles(csv);
}

function CopiarCadenaAlPortapapeles(cadena) {

   const textarea = document.createElement("textarea");
   textarea.value = cadena;
   document.body.appendChild(textarea);
   textarea.select();
   document.execCommand("copy");
   document.body.removeChild(textarea);

   alert("Texto copiado al portapapeles: " + cadena);
}

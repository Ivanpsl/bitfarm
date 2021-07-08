
// eslint-disable-next-line no-undef
const params = new URLSearchParams(location.search);
console.log(JSON.stringify(params))
var mensaje = params.getAll("mensaje");
var tipoMensaje = params.get("tipoMensaje");
var iconElement =   `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>`
console.log(JSON.stringify(mensaje));
if (mensaje.length >0) {
console.log("asdasd " + JSON.stringify(mensaje));
    if (tipoMensaje === "" || !tipoMensaje) {
        tipoMensaje = 'alert-danger';
    }
    for (let value of mensaje) {
        // eslint-disable-next-line no-undef
        $("#msContainer")
            .append(`<div class='alert ${tipoMensaje} m-0 d-flex align-items-center' role='alert'>${iconElement}<div>${value}</div></div>`);
    }
}



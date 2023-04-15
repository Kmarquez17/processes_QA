//1.Buscar las lineas
//2.Consultamos los motivos de la linea
//https://zeroq.cl/api/v1/lines/{idLine}/attention_reasons/ (GET)
//3.Eliminamos todos los motivos
//https://zeroq.cl/api/v1/lines/{idLine}/attention_reasons/{idMotivo} (DELETE)
//4.Agregamos nuevos motivos
//https://zeroq.cl/api/v1/lines/{idLine}/attention_reasons/ (POST)
//attention_reason= {
//     active: true,
//     line_id: {idLine},
//     name: "Motivo 2"
// }

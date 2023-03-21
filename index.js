// const got = require("got");
//const assert = require('assert');
import assert from "assert";
import got from "got";

const HOST_TURN = "https://aws.zeroq.cl/services";
// const HOST_TURN = "https://staging2.zeroq.cl/service";

const HOST_TURN_V1 = "https://zeroq.cl";
// const HOST_TURN_V1 = "https://staging.zeroq.cl";

const request = async (url, token = "", isPostGet = false, body) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const options = isPostGet
    ? {
        json: body,
      }
    : null;

  const response = await got(url, {
    headers,
    ...options,
    method: isPostGet ? "POST" : "GET",
  });

  // console.log('response.statusCode', response.statusCode);

  assert.equal(response.statusCode, 200, "Expected a 200 OK response");

  return JSON.parse(response.body);
};

const getToken = async () => {
  const login = {
    user: "kmarquez@zeroq.cl",
    password: "km199717*",
  };
  const { token } = await request(
    `${HOST_TURN_V1}/login/password`,
    "",
    true,
    login
  );

  return token;
};

const getOfficeID = async (token) => {
  //Sacamos el ID de la oficina
  const nameOffice = "QA Automation - Automática";
  // const nameOffice = "Kevin QA";
  const offices = await request(
    `${HOST_TURN}/turn-o-matic/users/offices`,
    token,
    false
  );

  return offices.filter(({ name }) => name === nameOffice)[0].id;
};

const getModuleID = async (token, officeId) => {
  const nameModule = "Modulo 1";
  const modules = await request(
    `${HOST_TURN}/turn-o-matic/offices/${officeId}/modulos`,
    token,
    false
  );
  //   return modules[Math.floor(Math.random() * modules.length)].id;

  return modules.filter(({ name }) => name === nameModule)[0].id;
};

const getFilaID = async (token, officeId, moduleId) => {
  const filas = await request(
    `${HOST_TURN}/turn-o-matic/offices/${officeId}/modulos/${moduleId}/lines`,
    token,
    false
  );

  return filas[Math.floor(Math.random() * filas.length)].id;
};

const createTicket = async (token, officeId, lineId) => {
  return await request(
    `${HOST_TURN}/turn-o-matic/offices/${officeId}/tickets/new`,
    token,
    true,
    {
      line_id: lineId,
    }
  );
};

// Start function
const start = async function () {
  // const token = await getToken();
  const token =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0OEhKT0gyOEd3TWtnekVaSFdWc1ZqUFlWVjMzIiwidXNlciI6eyJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwidWlkIjoiNDhISk9IMjhHd01rZ3pFWkhXVnNWalBZVlYzMyIsIm5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidHlwZSI6ImFkbWluIiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJtZXRhIjp7Im5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidGVtcG9yYXJ5IjpmYWxzZX19LCJ0eXBlIjoiYWRtaW4iLCJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJpYXQiOjE2Njk2NDA3ODAsImlzcyI6Ilplcm9RIn0.B8TuKT_qMUvDSQxhqiWYHHrnbcK_a4xaqGbXeOzAylNaWSOPIEkbFWyhvBzqJcjwuXwsHxk8k_Y0QkS9KRpinQ";
  const officeId = await getOfficeID(token);
  // console.log("Oficina ---> ", officeId);
  const moduleId = await getModuleID(token, officeId);
  const lineId = await getFilaID(token, officeId, moduleId);

  const ticket = await createTicket(token, officeId, lineId);
  console.log("Ticket creado a la fila: " + lineId);
};

for (let index = 0; index < 500; index++) {
  start();
}

//--Realizar test creacion con la botonera web ()

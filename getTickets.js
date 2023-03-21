// const got = require("got");
//const assert = require('assert');
import assert from "assert";
import got from "got";
import fetch from "node-fetch";

const isPrdOrStaging = true;
const isGotRequest = true;

const HOST_TURN = isPrdOrStaging
  ? "https://aws.zeroq.cl/services"
  : "https://staging2.zeroq.cl/service";
// const HOST_TURN = "https://staging2.zeroq.cl/service";

const HOST_TURN_V1 = isPrdOrStaging
  ? "https://zeroq.cl"
  : "https://staging.zeroq.cl";

const request = async (url, token = "", isPostGet = false, body) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const bodyParams = isGotRequest
    ? { json: body }
    : { body: JSON.stringify(body) };

  let options = isPostGet ? bodyParams : null;
  options = {
    headers,
    ...options,
    method: isPostGet ? "POST" : "GET",
  };

  const resp = isGotRequest
    ? await got(url, options)
    : await fetch(url, options);
  const data = isGotRequest ? JSON.parse(resp.body) : await resp.json();

  if (isGotRequest)
    assert.equal(resp.statusCode, 200, "Expected a 200 OK response");

  return data;
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
  const nameOffice = isPrdOrStaging ? "QA Automation - Automática" : "Kevin QA";
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

  return modules.filter(({ name }) => name === nameModule)[0];
};

const getFilaID = async (token, officeId, moduleId) => {
  const filas = await request(
    `${HOST_TURN}/turn-o-matic/offices/${officeId}/modulos/${moduleId}/lines`,
    token,
    false
  );

  return filas[Math.floor(Math.random() * filas.length)];
};

const promiseAllParallel = (fn, amountTicket) => {
  const requests = [];
  for (let index = 0; index < amountTicket; index++) {
    requests.push(fn);
  }

  return requests;
};

const createTicket = async (data) => {
  const { token, officeId, lineId, amountTicket } = data;
  const requests = promiseAllParallel(
    request(
      `${HOST_TURN}/turn-o-matic/offices/${officeId}/tickets/new`,
      token,
      true,
      {
        line_id: lineId,
      }
    ),
    amountTicket
  );

  const responses = await Promise.all(requests);
  let countTicket = 0;
  responses.forEach((response) => {
    // console.log("response", response);
    if (!response.status) {
      countTicket++;
    }
  });

  return countTicket;
};

const getTickets = async (data) => {
  const { token, officeId, moduleId, amountTicket } = data;
  const requests = promiseAllParallel(
    request(
      `${HOST_TURN}/turn-o-matic/offices/${officeId}/modulos/${moduleId}/tickets`,
      token,
      false
    ),
    amountTicket
  );
  const responses = await Promise.all(requests);
  let responseOk = 0;
  responses.forEach((response) => {
    // console.log("response", response);
    if (!response.status) {
      responseOk++;
    }
  });

  return responseOk;
};

// Start function
const start = async function () {
  // const token = await getToken();
  const token =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0OEhKT0gyOEd3TWtnekVaSFdWc1ZqUFlWVjMzIiwidXNlciI6eyJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwidWlkIjoiNDhISk9IMjhHd01rZ3pFWkhXVnNWalBZVlYzMyIsIm5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidHlwZSI6ImFkbWluIiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJtZXRhIjp7Im5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidGVtcG9yYXJ5IjpmYWxzZX19LCJ0eXBlIjoiYWRtaW4iLCJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJpYXQiOjE2Njk2NDA3ODAsImlzcyI6Ilplcm9RIn0.B8TuKT_qMUvDSQxhqiWYHHrnbcK_a4xaqGbXeOzAylNaWSOPIEkbFWyhvBzqJcjwuXwsHxk8k_Y0QkS9KRpinQ";

  const amountTicket = 3;
  const officeId = await getOfficeID(token);
  const { id: moduleId, name: NameModule } = await getModuleID(token, officeId);
  const { id: lineId, name: NameFile } = await getFilaID(
    token,
    officeId,
    moduleId
  );

  let data = {
    token,
    officeId,
    moduleId,
    lineId,
    amountTicket,
  };
  console.log(`Oficina:${officeId} / Modulo:${NameModule} / Linea:${NameFile}`);
  const responseCreated = await createTicket(data);
  console.log(`Ticket creados:${responseCreated}`);
  const responseOk = await getTickets(data);
  console.log(`Ticket consultados:${responseOk}`);
};

start();

//--Realizar test creacion con la botonera web ()

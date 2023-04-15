import assert from "assert";
import got from "got";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

import { get, post } from "./services/requestAPI.js";

const isPrdOrStaging = false;
const isGotRequest = true;

// const getToken = async () => {
//   const login = {
//     user: "kmarquez@zeroq.cl",
//     password: "km199717*",
//   };
//   const { token } = await request(
//     `${HOST_PAGE_MOD}/login/password`,
//     "",
//     true,
//     login
//   );

//   return token;
// };

const getOfficeID = async () => {
  //Sacamos el ID de la oficina
  const nameOffice = isPrdOrStaging ? "QA Automation - Automática" : "Kevin QA";
  const offices = await get(`/turn-o-matic/users/offices`);

  return offices.filter(({ name }) => name === nameOffice)[0].id;
};

const getModuleID = async (officeId) => {
  const nameModule = "Modulo 1";

  const modules = await get(`/turn-o-matic/offices/${officeId}/modulos`);

  return modules.filter(({ name }) => name === nameModule)[0];
};

const getFilaID = async (officeId, moduleId) => {
  const filas = await get(
    `/turn-o-matic/offices/${officeId}/modulos/${moduleId}/lines`
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
  const { officeId, lineId, amountTicket } = data;
  const requests = promiseAllParallel(
    post(`/turn-o-matic/offices/${officeId}/tickets/new`, {
      line_id: lineId,
    }),
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

const getTickets = async (officeId, moduleId) => {
  const tickets = await get(
    `/turn-o-matic/offices/${officeId}/modulos/${moduleId}/tickets`
  );
  return tickets.length;
};

// Start function
const start = async function () {
  // const token = await getToken();
  const token =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0OEhKT0gyOEd3TWtnekVaSFdWc1ZqUFlWVjMzIiwidXNlciI6eyJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwidWlkIjoiNDhISk9IMjhHd01rZ3pFWkhXVnNWalBZVlYzMyIsIm5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidHlwZSI6ImFkbWluIiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJtZXRhIjp7Im5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidGVtcG9yYXJ5IjpmYWxzZX19LCJ0eXBlIjoiYWRtaW4iLCJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJpYXQiOjE2Njk2NDA3ODAsImlzcyI6Ilplcm9RIn0.B8TuKT_qMUvDSQxhqiWYHHrnbcK_a4xaqGbXeOzAylNaWSOPIEkbFWyhvBzqJcjwuXwsHxk8k_Y0QkS9KRpinQ";

  const amountTicket = 1;
  const officeId = await getOfficeID();
  const { id: moduleId, name: NameModule } = await getModuleID(officeId);
  const { id: lineId, name: NameFile } = await getFilaID(officeId, moduleId);

  let data = {
    token,
    officeId,
    moduleId,
    lineId,
    amountTicket,
  };

  console.log("**********************************************************");
  console.log(`Oficina:${officeId} / Modulo:${NameModule} / Linea:${NameFile}`);
  const responseCreated = await createTicket(data);
  console.log(`Ticket creados: ${responseCreated}`);
  const responseOk = await getTickets(officeId, moduleId);
  console.log(`Ticket consultados: ${responseOk}`);
  console.log("**********************************************************");
};

start();

//--Realizar test creacion con la botonera web ()

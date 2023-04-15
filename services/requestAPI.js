import * as dotenv from "dotenv";
import assert from "assert";
import got from "got";
import fetch from "node-fetch";

dotenv.config();

const { HOST_API_V2 } = process.env;
const isGotRequest = false;

const requestFetch = async (url, options) => {
  const token =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0OEhKT0gyOEd3TWtnekVaSFdWc1ZqUFlWVjMzIiwidXNlciI6eyJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwidWlkIjoiNDhISk9IMjhHd01rZ3pFWkhXVnNWalBZVlYzMyIsIm5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidHlwZSI6ImFkbWluIiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJtZXRhIjp7Im5hbWUiOiJLZXZpbiBNYXJxdWV6IiwicnV0IjoiOTk5OTk5OTk5IiwidGVtcG9yYXJ5IjpmYWxzZX19LCJ0eXBlIjoiYWRtaW4iLCJpZCI6NDY0MzYxNiwidXNlcl9pZCI6NDY0MzYxNiwiZW1haWwiOiJrbWFycXVlekB6ZXJvcS5jbCIsInByb3ZpZGVyIjoiemVyb3EiLCJpYXQiOjE2Njk2NDA3ODAsImlzcyI6Ilplcm9RIn0.B8TuKT_qMUvDSQxhqiWYHHrnbcK_a4xaqGbXeOzAylNaWSOPIEkbFWyhvBzqJcjwuXwsHxk8k_Y0QkS9KRpinQ";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  //Validamos el method
  const { method } = options;

  if (method === "POST") {
    const body = {};
    const { data } = options;
    delete options.data;

    body[isGotRequest ? "json" : "body"] = isGotRequest
      ? data
      : JSON.stringify(data);

    options = {
      ...options,
      ...body,
    };
  }

  options = {
    headers,
    ...options,
  };

  //   console.log("options", options);

  const dominio = `${HOST_API_V2}${url}`;

  const resp = isGotRequest
    ? await got(dominio, options)
    : await fetch(dominio, options);
  const data = isGotRequest ? JSON.parse(resp.body) : await resp.json();

  if (isGotRequest)
    assert.equal(resp.statusCode, 200, "Expected a 200 OK response");

  return data;
};

export const post = async (url, data) => {
  return await requestFetch(url, {
    method: "POST",
    data,
  }).catch((error) => console.log(error));
};

export const get = async (url) => {
  return await requestFetch(url, {
    method: "GET",
  }).catch((error) => console.log(error));
};

export const put = async (url, data) => {
  return await requestFetch(url, {
    method: "PUT",
    data,
  }).catch((error) => console.log(error));
};

export const deleted = async (url) => {
  return await requestFetch(url, {
    method: "DELETE",
  }).catch((error) => console.log(error));
};

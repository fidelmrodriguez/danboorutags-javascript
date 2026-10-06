"use strict";

const DANBOORU_ORIGIN = "https://danbooru.donmai.us";
const ALLOWED_RESOURCES = new Set(["tags.json", "posts.json"]);
const REQUEST_TIMEOUT_MS = 25000;

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    },
    body: JSON.stringify(payload)
  };
}

function getResource(event) {
  const path = String(event.path || "");
  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) || "";
}

function appendQueryParams(url, event) {
  const multi = event.multiValueQueryStringParameters;

  if (
    multi &&
    typeof multi === "object" &&
    Object.keys(multi).length > 0
  ) {
    for (const [key, values] of Object.entries(multi)) {
      for (const value of values || []) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    return;
  }

  for (const [key, value] of Object.entries(event.queryStringParameters || {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }
}

function buildUserAgent() {
  const userId = String(process.env.DANBOORU_USER_ID || "").trim();

  return userId
    ? `danboorutags-javascript/1.1 (user #${userId})`
    : "danboorutags-javascript/1.1 (Netlify Function)";
}

function buildUpstreamHeaders() {
  const headers = {
    Accept: "application/json",
    "User-Agent": buildUserAgent()
  };

  const login = String(process.env.DANBOORU_LOGIN || "").trim();
  const apiKey = String(process.env.DANBOORU_API_KEY || "").trim();

  if (login && apiKey) {
    headers.Authorization = `Basic ${Buffer.from(`${login}:${apiKey}`).toString("base64")}`;
  }

  return headers;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, {
      error: "Método não permitido."
    }, {
      Allow: "GET"
    });
  }

  const resource = getResource(event);

  if (!ALLOWED_RESOURCES.has(resource)) {
    return jsonResponse(404, {
      error: "Recurso do Danbooru não permitido."
    });
  }

  const upstreamUrl = new URL(`/${resource}`, DANBOORU_ORIGIN);
  appendQueryParams(upstreamUrl, event);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: buildUpstreamHeaders(),
      signal: controller.signal,
      redirect: "follow"
    });

    const body = await response.text();
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const cloudflare =
        response.status === 403 &&
        (/cloudflare/i.test(body) || /just a moment/i.test(body));

      return jsonResponse(response.status, {
        error: `Danbooru respondeu HTTP ${response.status} ${response.statusText}`.trim(),
        details: cloudflare
          ? "O Danbooru/Cloudflare bloqueou a requisição do servidor. Se isso persistir, configure DANBOORU_LOGIN, DANBOORU_API_KEY e DANBOORU_USER_ID no Netlify."
          : body.slice(0, 500)
      }, {
        "X-Danbooru-Upstream-Status": String(response.status)
      });
    }

    if (!contentType.toLowerCase().includes("json")) {
      return jsonResponse(502, {
        error: "O Danbooru retornou uma resposta inesperada em vez de JSON.",
        details: body.slice(0, 500)
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body
    };
  } catch (error) {
    if (error && error.name === "AbortError") {
      return jsonResponse(504, {
        error: "A consulta ao Danbooru excedeu o tempo limite."
      });
    }

    return jsonResponse(502, {
      error: "Não foi possível consultar o Danbooru pelo servidor do Netlify.",
      details: error instanceof Error ? error.message : String(error)
    });
  } finally {
    clearTimeout(timeout);
  }
};

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  students: process.env.STUDENTS_TABLE || "QueVivaElFutbol_Students",
  attendance: process.env.ATTENDANCE_TABLE || "QueVivaElFutbol_Attendance",
  transactions: process.env.TRANSACTIONS_TABLE || "QueVivaElFutbol_Transactions",
};

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.rawPath || event.path || "/";

  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    if (path.includes("/students")) {
      if (method === "GET") {
        const res = await docClient.send(new ScanCommand({ TableName: TABLES.students }));
        return { statusCode: 200, headers, body: JSON.stringify(res.Items || []) };
      }
      if (method === "POST" || method === "PUT") {
        const item = JSON.parse(event.body || "{}");
        if (!item.id) item.id = `stu-${Date.now()}`;
        await docClient.send(new PutCommand({ TableName: TABLES.students, Item: item }));
        return { statusCode: 200, headers, body: JSON.stringify(item) };
      }
      if (method === "DELETE") {
        const id = event.queryStringParameters?.id || path.split("/").pop();
        await docClient.send(new DeleteCommand({ TableName: TABLES.students, Key: { id } }));
        return { statusCode: 200, headers, body: JSON.stringify({ deleted: id }) };
      }
    }

    if (path.includes("/attendance")) {
      if (method === "GET") {
        const date = event.queryStringParameters?.date;
        const res = await docClient.send(new ScanCommand({ TableName: TABLES.attendance }));
        const items = res.Items || [];
        if (date) {
          const found = items.find((d) => d.date === date);
          return { statusCode: 200, headers, body: JSON.stringify(found || { date, records: {} }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }
      if (method === "POST" || method === "PUT") {
        const body = JSON.parse(event.body || "{}");
        const record = {
          date: body.date,
          records: body.records || {},
          updatedAt: new Date().toISOString(),
        };
        await docClient.send(new PutCommand({ TableName: TABLES.attendance, Item: record }));
        return { statusCode: 200, headers, body: JSON.stringify(record) };
      }
    }

    if (path.includes("/transactions")) {
      if (method === "GET") {
        const res = await docClient.send(new ScanCommand({ TableName: TABLES.transactions }));
        return { statusCode: 200, headers, body: JSON.stringify(res.Items || []) };
      }
      if (method === "POST") {
        const item = JSON.parse(event.body || "{}");
        if (!item.id) item.id = `tx-${Date.now()}`;
        await docClient.send(new PutCommand({ TableName: TABLES.transactions, Item: item }));
        return { statusCode: 201, headers, body: JSON.stringify(item) };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Ruta no encontrada", path, method }),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor", details: err.message }),
    };
  }
};

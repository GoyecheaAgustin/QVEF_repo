import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.USER_POOL_ID || "";

const TABLES = {
  students: process.env.STUDENTS_TABLE || "QueVivaElFutbol_Students",
  attendance: process.env.ATTENDANCE_TABLE || "QueVivaElFutbol_Attendance",
  transactions: process.env.TRANSACTIONS_TABLE || "QueVivaElFutbol_Transactions",
  coaches: process.env.COACHES_TABLE || "QueVivaElFutbol_Coaches",
};

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

async function provisionCognitoCoach(email, name, enabled) {
  if (!USER_POOL_ID || !email) return;
  const cleanEmail = email.trim().toLowerCase();

  try {
    await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: cleanEmail,
      })
    );
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: cleanEmail,
          UserAttributes: [
            { Name: "email", Value: cleanEmail },
            { Name: "email_verified", Value: "true" },
            ...(name ? [{ Name: "name", Value: name }] : []),
          ],
          DesiredDeliveryMediums: ["EMAIL"],
        })
      );
    } else {
      throw err;
    }
  }

  if (enabled) {
    await cognitoClient.send(
      new AdminEnableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: cleanEmail,
      })
    );
  } else {
    await cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: cleanEmail,
      })
    );
  }
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.rawPath || event.path || "/";

  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    // ALUMNOS (/students)
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

    // PROFES (/coaches) + envio de clave temporal / habilitacion en Cognito
    if (path.includes("/coaches")) {
      if (method === "GET") {
        const res = await docClient.send(new ScanCommand({ TableName: TABLES.coaches }));
        return { statusCode: 200, headers, body: JSON.stringify(res.Items || []) };
      }
      if (method === "POST" || method === "PUT") {
        const item = JSON.parse(event.body || "{}");
        if (!item.id) item.id = `profe-${Date.now()}`;
        await docClient.send(new PutCommand({ TableName: TABLES.coaches, Item: item }));

        if (item.email && USER_POOL_ID) {
          await provisionCognitoCoach(item.email, item.name, Boolean(item.enabled));
        }

        return { statusCode: 200, headers, body: JSON.stringify(item) };
      }
      if (method === "DELETE") {
        const id = event.queryStringParameters?.id || path.split("/").pop();
        await docClient.send(new DeleteCommand({ TableName: TABLES.coaches, Key: { id } }));
        return { statusCode: 200, headers, body: JSON.stringify({ deleted: id }) };
      }
    }

    // ASISTENCIAS (/attendance)
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

    // CAJA / TRANSACCIONES (/transactions)
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

// Integração com a API REST do Power BI usando Service Principal
// (fluxo "App Owns Data"). Tudo aqui roda SOMENTE no servidor.

const AUTHORITY = "https://login.microsoftonline.com";
const PBI_API = "https://api.powerbi.com/v1.0/myorg";
const SCOPE = "https://analysis.windows.net/powerbi/api/.default";

// Passo 1 — obtém um token AAD via client credentials (service principal).
async function getAadToken(): Promise<string> {
  const tenant = process.env.PBI_TENANT_ID!;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.PBI_CLIENT_ID!,
    client_secret: process.env.PBI_CLIENT_SECRET!,
    scope: SCOPE,
  });

  const res = await fetch(`${AUTHORITY}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao obter token AAD: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

interface ReportInfo {
  embedUrl: string;
  datasetId: string;
}

// Passo 2 — detalhes do relatório (embedUrl + datasetId).
async function getReportInfo(
  aadToken: string,
  workspaceId: string,
  reportId: string
): Promise<ReportInfo> {
  const res = await fetch(
    `${PBI_API}/groups/${workspaceId}/reports/${reportId}`,
    {
      headers: { Authorization: `Bearer ${aadToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao buscar relatório: ${res.status} ${text}`);
  }
  const json = await res.json();
  return { embedUrl: json.embedUrl, datasetId: json.datasetId };
}

export interface PowerBiEmbed {
  reportId: string;
  embedUrl: string;
  accessToken: string;
  expiry: string;
}

// Passo 3 — gera o embed token (accessLevel View) para o relatório.
export async function generateEmbed(
  workspaceId: string,
  reportId: string
): Promise<PowerBiEmbed> {
  const aadToken = await getAadToken();
  const info = await getReportInfo(aadToken, workspaceId, reportId);

  const res = await fetch(
    `${PBI_API}/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessLevel: "View" }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao gerar embed token: ${res.status} ${text}`);
  }
  const json = await res.json();

  return {
    reportId,
    embedUrl: info.embedUrl,
    accessToken: json.token,
    expiry: json.expiration,
  };
}

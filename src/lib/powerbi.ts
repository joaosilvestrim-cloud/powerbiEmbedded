// Integração com a API REST do Power BI usando Service Principal
// (fluxo "App Owns Data"). Tudo aqui roda SOMENTE no servidor.

const AUTHORITY = "https://login.microsoftonline.com";
const PBI_API = "https://api.powerbi.com/v1.0/myorg";
const SCOPE = "https://analysis.windows.net/powerbi/api/.default";

// Credenciais do service principal — vêm da tabela config_powerbi.
export interface PbiCredenciais {
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

// Passo 1 — obtém um token AAD via client credentials (service principal).
async function getAadToken(cred: PbiCredenciais): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: cred.client_id,
    client_secret: cred.client_secret,
    scope: SCOPE,
  });

  const res = await fetch(`${AUTHORITY}/${cred.tenant_id}/oauth2/v2.0/token`, {
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

export interface PbiWorkspace {
  id: string;
  name: string;
}

export interface PbiReport {
  id: string;
  name: string;
  webUrl?: string;
}

// Testa as credenciais e lista os workspaces (groups) visíveis ao
// service principal. Lança erro com a mensagem do Power BI se falhar.
export async function listWorkspaces(
  cred: PbiCredenciais
): Promise<PbiWorkspace[]> {
  const aadToken = await getAadToken(cred);
  const res = await fetch(`${PBI_API}/groups`, {
    headers: { Authorization: `Bearer ${aadToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power BI ${res.status}: ${text}`);
  }
  const json = await res.json();
  return (json.value ?? []).map((g: { id: string; name: string }) => ({
    id: g.id,
    name: g.name,
  }));
}

// Lista os relatórios de um workspace.
export async function listReports(
  cred: PbiCredenciais,
  workspaceId: string
): Promise<PbiReport[]> {
  const aadToken = await getAadToken(cred);
  const res = await fetch(`${PBI_API}/groups/${workspaceId}/reports`, {
    headers: { Authorization: `Bearer ${aadToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power BI ${res.status}: ${text}`);
  }
  const json = await res.json();
  return (json.value ?? []).map(
    (r: { id: string; name: string; webUrl?: string }) => ({
      id: r.id,
      name: r.name,
      webUrl: r.webUrl,
    })
  );
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

// RLS dinâmico: identidade efetiva aplicada no servidor da Microsoft.
// - username: valor usado pelas regras DAX (USERNAME()/USERPRINCIPALNAME())
// - roles: nome(s) da(s) role(s) de RLS definidas no .pbix (ex.: "Cliente")
// - customData: alternativa usada com CUSTOMDATA() (comum com service principal)
export interface EffectiveIdentity {
  username: string;
  roles: string[];
  customData?: string;
}

// Passo 3 — gera o embed token (accessLevel View) para o relatório.
// Se `identity` for informado, o token nasce JÁ FILTRADO (RLS dinâmico):
// o usuário não consegue ver dados de outro cliente nem inspecionando a página.
export async function generateEmbed(
  cred: PbiCredenciais,
  workspaceId: string,
  reportId: string,
  identity?: EffectiveIdentity
): Promise<PowerBiEmbed> {
  const aadToken = await getAadToken(cred);
  const info = await getReportInfo(aadToken, workspaceId, reportId);

  const body: Record<string, unknown> = { accessLevel: "View" };
  if (identity && identity.roles.length > 0) {
    body.identities = [
      {
        username: identity.username,
        roles: identity.roles,
        datasets: [info.datasetId],
        ...(identity.customData ? { customData: identity.customData } : {}),
      },
    ];
  }

  const res = await fetch(
    `${PBI_API}/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

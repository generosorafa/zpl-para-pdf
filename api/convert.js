const ALLOWED_DPMM = new Set([6, 8, 12, 24]);
const MAX_BYTES = 900000;
const MAX_LABELS = 50;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });

  try {
    const { zpl = '', dpmm = 8, width = 4, height = 6, pageMode = 'label' } = req.body || {};
    const content = String(zpl).trim();
    const density = Number(dpmm);
    const w = Number(width);
    const h = Number(height);

    if (!content || !/\^XA/i.test(content) || !/\^XZ/i.test(content)) {
      return json(res, 400, { error: 'Envie um ZPL válido contendo ^XA e ^XZ.' });
    }
    if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) return json(res, 413, { error: 'O arquivo excede 900 KB.' });
    const labels = (content.match(/\^XZ/gi) || []).length;
    if (labels > MAX_LABELS) return json(res, 413, { error: `O limite é de ${MAX_LABELS} etiquetas por conversão.` });
    if (!ALLOWED_DPMM.has(density)) return json(res, 400, { error: 'Resolução inválida.' });
    if (![w, h].every(v => Number.isFinite(v) && v >= 0.5 && v <= 15)) return json(res, 400, { error: 'Dimensões inválidas.' });

    const endpoint = `https://api.labelary.com/v1/printers/${density}dpmm/labels/${w}x${h}/`;
    const headers = { Accept: 'application/pdf', 'Content-Type': 'application/x-www-form-urlencoded' };

    if (pageMode === 'a4') {
      const portrait = { columns: Math.max(1, Math.floor(8.27 / w)), rows: Math.max(1, Math.floor(11.69 / h)), orientation: 'Portrait' };
      const landscape = { columns: Math.max(1, Math.floor(11.69 / w)), rows: Math.max(1, Math.floor(8.27 / h)), orientation: 'Landscape' };
      const best = portrait.columns * portrait.rows >= landscape.columns * landscape.rows ? portrait : landscape;
      headers['X-Page-Size'] = 'A4';
      headers['X-Page-Orientation'] = best.orientation;
      headers['X-Page-Layout'] = `${best.columns}x${best.rows}`;
      headers['X-Page-Align'] = 'Center';
      headers['X-Page-Vertical-Align'] = 'Center';
    }

    const response = await fetch(endpoint, { method: 'POST', headers, body: content, signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 200);
      return json(res, response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'Limite temporário atingido. Tente novamente em instantes.' : `Falha na conversão. ${detail}` });
    }

    const pdf = Buffer.from(await response.arrayBuffer());
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="etiquetas-zpl.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(pdf);
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return json(res, timeout ? 504 : 500, { error: timeout ? 'A conversão demorou demais.' : 'Erro inesperado durante a conversão.' });
  }
}

const filesInput = document.querySelector('#files');
const fileList = document.querySelector('#fileList');
const preset = document.querySelector('#preset');
const width = document.querySelector('#width');
const height = document.querySelector('#height');
const form = document.querySelector('#form');
const status = document.querySelector('#status');
const submit = document.querySelector('#submit');

let selectedFiles = [];

filesInput.addEventListener('change', () => {
  selectedFiles = [...filesInput.files];
  fileList.textContent = selectedFiles.length ? `${selectedFiles.length} arquivo(s) selecionado(s)` : '';
});

preset.addEventListener('change', () => {
  if (preset.value === 'custom') return;
  const [w, h] = preset.value.split('x');
  width.value = w;
  height.value = h;
});

async function readFiles() {
  const parts = [];
  for (const file of selectedFiles) {
    if (!/\.(zpl|txt)$/i.test(file.name)) throw new Error(`Formato não aceito: ${file.name}`);
    parts.push(await file.text());
  }
  const pasted = document.querySelector('#zpl').value.trim();
  if (pasted) parts.push(pasted);
  return parts.join('\n');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.className = '';
  status.textContent = '';

  if (!document.querySelector('#consent').checked) {
    status.className = 'error';
    status.textContent = 'Confirme o aviso de processamento externo.';
    return;
  }

  try {
    const zpl = await readFiles();
    if (!zpl.trim()) throw new Error('Selecione um arquivo ou cole um código ZPL.');

    submit.disabled = true;
    submit.textContent = 'Convertendo…';
    status.textContent = 'Processando etiquetas…';

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zpl,
        dpmm: Number(document.querySelector('#dpmm').value),
        width: Number(width.value),
        height: Number(height.value),
        pageMode: document.querySelector('#pageMode').value
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Não foi possível converter o arquivo.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'etiquetas-zpl.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    status.className = 'success';
    status.textContent = 'PDF gerado com sucesso.';
  } catch (error) {
    status.className = 'error';
    status.textContent = error.message;
  } finally {
    submit.disabled = false;
    submit.textContent = 'Converter para PDF';
  }
});

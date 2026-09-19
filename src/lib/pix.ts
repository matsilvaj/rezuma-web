/**
 * Código Pix "copia e cola" estático, no padrão BR Code do Banco Central.
 *
 * O mesmo texto vira o QR code. É um EMV: cada campo é ID de 2 dígitos,
 * tamanho de 2 dígitos e o valor. O último campo é um CRC16 sobre todo o
 * resto; um bit errado ali e o app do banco recusa o código inteiro.
 *
 * Estático e sem valor fixo: a pessoa escolhe quanto doar no próprio banco.
 */

function campo(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

/**
 * O BR Code aceita só ASCII básico em nome e cidade, com limite de tamanho.
 * Acento quebraria o tamanho declarado, que conta bytes e não caracteres.
 */
function limpar(texto: string, max: number): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), como exige o manual. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function pixCopiaECola({
  chave,
  nome,
  cidade,
}: {
  chave: string;
  nome: string;
  cidade: string;
}): string {
  const contaDoRecebedor =
    campo("00", "br.gov.bcb.pix") +
    campo("01", chave.trim());

  const semCrc =
    campo("00", "01") +                       // versão do payload
    campo("26", contaDoRecebedor) +
    campo("52", "0000") +                     // categoria: não se aplica
    campo("53", "986") +                      // moeda: real
    campo("58", "BR") +
    campo("59", limpar(nome, 25)) +
    campo("60", limpar(cidade, 15)) +
    campo("62", campo("05", "***")) +         // sem identificador de cobrança
    "6304";                                   // o CRC entra aqui, sobre tudo acima

  return semCrc + crc16(semCrc);
}

/**
 * O BR Code exige nome e cidade do recebedor, mas o app do banco não os usa
 * para dizer quem recebe: ele consulta a chave e mostra o titular real da
 * conta. Por isso ficam fixos aqui e só a chave vem do ambiente.
 */
const NOME_RECEBEDOR   = "Rezuma";
const CIDADE_RECEBEDOR = "Brasil";

/**
 * Sem a chave configurada o convite de doação simplesmente não aparece, em
 * vez de mostrar um QR quebrado.
 */
export function pixConfigurado(): { chave: string; codigo: string } | null {
  const chave = (process.env.NEXT_PUBLIC_PIX_KEY ?? "").trim();
  if (!chave) return null;
  return {
    chave,
    codigo: pixCopiaECola({ chave, nome: NOME_RECEBEDOR, cidade: CIDADE_RECEBEDOR }),
  };
}

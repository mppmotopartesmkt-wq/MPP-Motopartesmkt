/**
 * Servicio oficial de integración con Pasarela de Pagos Bold (Colombia)
 * Soporta:
 * - Tarjetas de Crédito y Débito (Visa, Mastercard, Amex, Diners)
 * - PSE (Bancolombia, Nequi, Daviplata, Davivienda, Banco de Bogotá, etc.)
 * - Botón Bancolombia
 * - Modal Embebido (Embedded Checkout) y Redirección segura
 */

// Credenciales de Producción Bold Colombia suministradas por el comercio
export const BOLD_IDENTITY_KEY =
  (import.meta.env.VITE_BOLD_IDENTITY_KEY as string) ||
  'z-Hlwsk7vK7bsK2IsBoOX9Lczpz2Fd6dmiWjpxT585I';

export const BOLD_SECRET_KEY =
  (import.meta.env.VITE_BOLD_SECRET_KEY as string) ||
  'Lveoj_ZDg0tvqgeSSbfMcA';

export const BOLD_SCRIPT_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

export interface BoldCheckoutParams {
  orderId: string;
  amount: number; // Monto en COP (sin decimales)
  description?: string;
  customerEmail?: string;
  customerName?: string;
  redirectionUrl?: string;
  renderMode?: 'embedded' | 'redirection';
  tax?: string;
}

export interface BoldCheckoutResult {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  integritySignature: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Genera la firma digital de integridad SHA-256 exigida por Bold:
 * Formula oficial: SHA256(order_id + amount + currency + secret_key)
 */
export async function generateBoldIntegritySignature(
  orderId: string,
  amount: number,
  currency: string = 'COP',
  secretKey: string = BOLD_SECRET_KEY
): Promise<string> {
  const cleanAmount = Math.round(amount).toString();
  const rawString = `${orderId}${cleanAmount}${currency}${secretKey}`;

  // Usar Web Crypto API nativa del navegador
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(rawString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.warn('Web Crypto fallo, recurriendo a cálculo alternativo:', e);
    }
  }

  // Fallback ligero en JavaScript para entornos sin subtle crypto
  return fallbackSha256(rawString);
}

/**
 * Carga de forma asíncrona y segura la librería de Bold en el documento
 */
export function loadBoldScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    // Si la librería ya está cargada y window.BoldCheckout existe
    if ((window as any).BoldCheckout) {
      return resolve(true);
    }

    const existingScript = document.querySelector(
      `script[src="${BOLD_SCRIPT_URL}"]`
    ) as HTMLScriptElement;

    if (existingScript) {
      if ((window as any).BoldCheckout) {
        return resolve(true);
      }
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = BOLD_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = (err) => {
      console.error('Error cargando el script oficial de Bold Checkout:', err);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Inicia el proceso de checkout oficial con Bold
 */
export async function openBoldCheckout(
  params: BoldCheckoutParams
): Promise<BoldCheckoutResult> {
  const {
    orderId,
    amount,
    description = `Compra MPR Repuestos - Orden ${orderId}`,
    redirectionUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?bold_order_id=${encodeURIComponent(orderId)}&status=approved`
      : 'https://mpr-repuestos.com',
    renderMode = 'embedded',
  } = params;

  try {
    const cleanAmount = Math.round(amount);
    const signature = await generateBoldIntegritySignature(orderId, cleanAmount, 'COP');

    // Asegurar que el script esté disponible
    await loadBoldScript();

    const BoldCheckout = (window as any).BoldCheckout;

    if (!BoldCheckout) {
      throw new Error(
        'No se pudo inicializar la pasarela Bold. Verifica la conexión a internet.'
      );
    }

    const config: Record<string, string> = {
      apiKey: BOLD_IDENTITY_KEY,
      orderId,
      amount: cleanAmount.toString(),
      currency: 'COP',
      integritySignature: signature,
      description,
      redirectionUrl,
      renderMode,
    };

    const checkoutInstance = new BoldCheckout(config);

    // Abrir el checkout modal o redirigir según la configuración
    checkoutInstance.open();

    return {
      success: true,
      orderId,
      amount: cleanAmount,
      currency: 'COP',
      integritySignature: signature,
    };
  } catch (err: any) {
    console.error('Error al abrir checkout de Bold:', err);
    return {
      success: false,
      orderId,
      amount,
      currency: 'COP',
      integritySignature: '',
      error: err.message || 'Error al conectar con Bold',
    };
  }
}

// ============================================================================
// Algoritmo SHA-256 ligero puro para contingencias
// ============================================================================
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const w = new Array(64);

  for (i = 0; i < ascii.length; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= code << ((3 - (i % 4)) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const temp1 = (h + sigma1 + ch + k[j] + w[j]) | 0;
      const temp2 = (sigma0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

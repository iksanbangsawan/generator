const { kv } = require('@vercel/kv');

const PERMANENT_CODES = ['IKSANMASTERADMIN','BUATIDEKONTENBERSAMAIKSAN','KANAKIRA'];
const SINGLE_USE_CODES = ["ACE-0066","ACE-121Z","ACE-2BMH","ACE-AS6R","ACE-ERTH","ACE-SPJO","ACE-YFJB","BEST-1FF2","BEST-56J8","BEST-75IC","BEST-B7GE","BEST-BYMF","BEST-E1H6","BEST-FRBF","BEST-H87B","BEST-NZKY","BISNIS-04F9","BISNIS-1W06","BISNIS-3XQG","BISNIS-6AHD","BISNIS-7IN6","BISNIS-9HK3","BISNIS-CV86","BISNIS-D7QB","BISNIS-OVBK","BISNIS-TMH8","BISNIS-ZCDL","BRAND-4JLF","BRAND-87HM","BRAND-8TH3","BRAND-98EM","BRAND-BF2R","BRAND-CTXC","BRAND-FWIZ","BRAND-IXPU","BRAND-IZJR","BRAND-M92K","BRAND-U6B8","BRAND-WSCE","BRAND-X0DV","BRAND-XEQ6","BRAND-XKOX","EXPERT-883B","EXPERT-K80N","EXPERT-MOBK","EXPERT-REOE","EXPERT-SC6J","EXPERT-TQVM","EXPERT-UUHP","GROW-2UL7","GROW-667P","GROW-6NWG","GROW-8KI9","GROW-QZCM","GROW-UNOH","GROW-ZN7H","HEBAT-1N2R","HEBAT-D6BL","HEBAT-F4AS","HEBAT-LUX2","HEBAT-MPUF","HEBAT-OFO4","HEBAT-XXCX","IDE-2W6A","IDE-5X8T","IDE-IH9L","IDE-K6OY","IDE-UJ49","JAGO-2PYX","JAGO-2TFW","JAGO-5EA0","JAGO-B8M0","JAGO-NI8E","JAGO-SN5J","JAGO-SXO9","JAGO-XE71","KEREN-1MQC","KEREN-3CVK","KEREN-MCH5","KEREN-SED0","KONTEN-4YR5","KONTEN-91KC","KONTEN-921D","KONTEN-CTU9","KONTEN-FLIC","KONTEN-U4ST","KONTEN-V3PO","KONTEN-VKPP","KONTEN-XZHC","KONTEN-Y89Q","KREASI-39EG","KREASI-3ZN6","KREASI-A47X","KREASI-AD4V","KREASI-G4G7","KREASI-ML64","KREASI-QS7M","KREASI-T242","KREASI-UCMS","KREASI-V62E","KREASI-YQEV","KREASI-ZQFA","KUAT-G8SS","KUAT-IF45","KUAT-IYZK","KUAT-JIAR","KUAT-PYCE","KUAT-RKT7","KUAT-SYJ2","KUAT-VD79","KUAT-YFDK","MAJU-01X0","MAJU-0WKH","MAJU-JZUB","MAJU-W1H2","MANTAP-K0J8","MANTAP-M9YD","MANTAP-QUAK","MANTAP-R2DU","MANTAP-R3SZ","MANTAP-RD3D","MANTAP-XFKW","MANTAP-ZCRV","MEDIA-687H","MEDIA-D93D","MEDIA-G1UM","MEDIA-JN3L","MEDIA-KWOW","MEDIA-M935","MEDIA-Q0G6","MEDIA-RGGS","MEDIA-RQIG","MEDIA-XFX5","PLUS-04JL","PLUS-0JWK","PLUS-0VMC","PLUS-TPQF","PRO-1ZM3","PRO-50K0","PRO-806M","PRO-A6XC","PRO-B1DS","PRO-DQSX","PRO-UZBJ","PRO-X975","PRO-XIQP","PRO-YQDS","SMART-1RYD","SMART-6YMA","SMART-79YP","SMART-EVWW","SMART-FMMU","SMART-OOYH","SMART-SOBQ","SMART-XXZ5","SMART-Z2YL","STAR-0769","STAR-8JGP","STAR-CLBX","STAR-DZUU","STAR-FBRP","STAR-M7MQ","STAR-RFUI","STAR-SDB0","STAR-UWVM","SUKSES-18KE","SUKSES-1QLY","SUKSES-7MJJ","SUKSES-ACNO","SUKSES-HM6I","TOP-3G5K","TOP-59N5","TOP-6C3Y","TOP-G92T","TOP-LOA0","TOP-TGDF","TOP-WGH1","VIRAL-0405","VIRAL-0HGD","VIRAL-6YHX","VIRAL-8XGQ","VIRAL-AZFW","VIRAL-F2OH","VIRAL-FFW2","VIRAL-PIPS","VIRAL-SZC1","VIRAL-T8XE","VIRAL-VLD8","VIRAL-XPGP","VIRAL-ZUKM","WIN-0TCO","WIN-2CTB","WIN-49BT","WIN-FALP","WIN-K4A8","WIN-MCRR","WIN-OC0U","WIN-OF32","WIN-S2IR","WIN-VKUD"];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const code = ((req.body || {}).access_code || '').trim().toUpperCase();

    if (!code) return res.status(200).json({ valid: false, error: 'Kode akses diperlukan.' });

    if (PERMANENT_CODES.includes(code)) {
      return res.status(200).json({ valid: true, type: 'permanent' });
    }

    if (SINGLE_USE_CODES.includes(code)) {
      const used = await kv.get('used:' + code);
      if (used) {
        return res.status(200).json({ valid: false, error: 'Kode akses sudah digunakan.' });
      }
      // Mark as used immediately on validate
      await kv.set('used:' + code, Date.now().toString());
      return res.status(200).json({ valid: true, type: 'single_use' });
    }

    return res.status(200).json({ valid: false, error: 'Kode akses tidak valid.' });

  } catch (err) {
    return res.status(500).json({ valid: false, error: 'Server error: ' + err.message });
  }
}

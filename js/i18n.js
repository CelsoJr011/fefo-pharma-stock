// Translations for the three languages I speak: English, Portuguese and French.
// Keys are grouped by screen area so it's easy to find what to change.

export const LANGUAGES = {
  en: { label: 'EN', locale: 'en-US', name: 'English' },
  pt: { label: 'PT', locale: 'pt-BR', name: 'Português' },
  fr: { label: 'FR', locale: 'fr-FR', name: 'Français' },
};

const messages = {
  en: {
    'page.title': 'FEFO Pharma Stock — batch & expiry control',
    'header.subtitle': 'Batch & expiry control for a pharmaceutical warehouse',
    'header.reset': 'Reset sample data',
    'header.language': 'Language',

    'summary.label': 'Stock summary',
    'summary.batches': 'Batches',
    'summary.units': 'Units in stock',
    'summary.expired': 'Expired',
    'summary.critical': 'Critical (≤ 30d)',
    'summary.warning': 'Warning (≤ 90d)',
    'summary.blocked': 'Blocked',
    'summary.coldChain': 'Cold chain batches',

    'picking.title': 'Picking suggestion',
    'picking.hint': "Pick a product and a quantity. The app suggests which batches to take, following FEFO and skipping anything that shouldn't leave the warehouse.",
    'picking.product': 'Product',
    'picking.quantity': 'Quantity',
    'picking.submit': 'Suggest picking',
    'picking.take': 'Take <strong>{qty}</strong> from batch <strong>{batch}</strong> at {location} (expires {date})',
    'picking.none': 'No batch can be picked for this product right now.',
    'picking.missing': 'Short by {missing} of {requested} units — let the team know before closing the order.',
    'picking.skipped': 'Skipped:',
    'picking.invalidQty': 'Enter a whole number greater than zero.',

    'skip.expired': 'expired',
    'skip.blocked': 'blocked (quality hold)',
    'skip.short shelf life': 'too close to expiry to ship',

    'table.title': 'Batches in stock',
    'table.search': 'Search product or batch…',
    'table.filter': 'Filter by status',
    'table.allStatuses': 'All statuses',
    'table.product': 'Product',
    'table.batch': 'Batch',
    'table.expiry': 'Expiry',
    'table.daysLeft': 'Days left',
    'table.qty': 'Qty',
    'table.location': 'Location',
    'table.status': 'Status',
    'table.empty': 'No batches found.',
    'table.block': 'Block',
    'table.release': 'Release',
    'table.coldTitle': 'Store between 2 and 8 °C',

    'filter.critical': 'Critical (≤ 30 days)',
    'filter.warning': 'Warning (≤ 90 days)',

    'status.expired': 'Expired',
    'status.critical': 'Critical',
    'status.warning': 'Warning',
    'status.ok': 'OK',
    'status.blocked': 'Blocked',

    'days.today': 'today',
    'days.ago': '{n} days ago',
    'days.agoOne': '1 day ago',
    'days.left': '{n} days',
    'days.leftOne': '1 day',

    'form.title': 'Receive a new batch',
    'form.sku': 'SKU',
    'form.product': 'Product',
    'form.batch': 'Batch',
    'form.expiry': 'Expiry date',
    'form.quantity': 'Quantity',
    'form.location': 'Location',
    'form.storage': 'Storage',
    'form.ambient': 'Ambient (15–30 °C)',
    'form.cold': 'Cold chain (2–8 °C)',
    'form.submit': 'Add batch',
    'form.duplicate': 'Batch {batch} already exists for {sku}.',
    'form.expired': 'This batch is already expired — it should not be received into stock.',
    'form.success': 'Batch {batch} received.',

    'footer.text': 'Fictional data, built for study. Made by',

    'product.DIP-500': 'Dipyrone 500mg — 10 tablets',
    'product.AMX-875': 'Amoxicillin 875mg — 14 tablets',
    'product.INS-NPH': 'NPH Insulin 100 IU/ml — vial',
    'product.VTC-1G': 'Vitamin C 1g — 10 effervescent tablets',
    'product.SRO-500': 'Saline solution 0.9% — 500ml',
  },

  pt: {
    'page.title': 'FEFO Pharma Stock — controle de lotes e validade',
    'header.subtitle': 'Controle de lotes e validade para um centro de distribuição de medicamentos',
    'header.reset': 'Restaurar dados de exemplo',
    'header.language': 'Idioma',

    'summary.label': 'Resumo do estoque',
    'summary.batches': 'Lotes',
    'summary.units': 'Unidades em estoque',
    'summary.expired': 'Vencidos',
    'summary.critical': 'Críticos (≤ 30d)',
    'summary.warning': 'Atenção (≤ 90d)',
    'summary.blocked': 'Bloqueados',
    'summary.coldChain': 'Lotes de cadeia fria',

    'picking.title': 'Sugestão de separação',
    'picking.hint': 'Escolha um produto e uma quantidade. O app sugere de quais lotes tirar, seguindo o FEFO e deixando de fora o que não deve sair do CD.',
    'picking.product': 'Produto',
    'picking.quantity': 'Quantidade',
    'picking.submit': 'Sugerir separação',
    'picking.take': 'Separar <strong>{qty}</strong> do lote <strong>{batch}</strong> no endereço {location} (vence em {date})',
    'picking.none': 'Nenhum lote deste produto pode ser separado agora.',
    'picking.missing': 'Faltam {missing} de {requested} unidades — avise a equipe antes de fechar o pedido.',
    'picking.skipped': 'Ignorados:',
    'picking.invalidQty': 'Digite um número inteiro maior que zero.',

    'skip.expired': 'vencido',
    'skip.blocked': 'bloqueado (qualidade)',
    'skip.short shelf life': 'validade curta demais para enviar',

    'table.title': 'Lotes em estoque',
    'table.search': 'Buscar produto ou lote…',
    'table.filter': 'Filtrar por status',
    'table.allStatuses': 'Todos os status',
    'table.product': 'Produto',
    'table.batch': 'Lote',
    'table.expiry': 'Validade',
    'table.daysLeft': 'Dias restantes',
    'table.qty': 'Qtd.',
    'table.location': 'Endereço',
    'table.status': 'Status',
    'table.empty': 'Nenhum lote encontrado.',
    'table.block': 'Bloquear',
    'table.release': 'Liberar',
    'table.coldTitle': 'Armazenar entre 2 e 8 °C',

    'filter.critical': 'Crítico (≤ 30 dias)',
    'filter.warning': 'Atenção (≤ 90 dias)',

    'status.expired': 'Vencido',
    'status.critical': 'Crítico',
    'status.warning': 'Atenção',
    'status.ok': 'OK',
    'status.blocked': 'Bloqueado',

    'days.today': 'hoje',
    'days.ago': 'há {n} dias',
    'days.agoOne': 'há 1 dia',
    'days.left': '{n} dias',
    'days.leftOne': '1 dia',

    'form.title': 'Receber um novo lote',
    'form.sku': 'SKU',
    'form.product': 'Produto',
    'form.batch': 'Lote',
    'form.expiry': 'Data de validade',
    'form.quantity': 'Quantidade',
    'form.location': 'Endereço',
    'form.storage': 'Armazenagem',
    'form.ambient': 'Ambiente (15–30 °C)',
    'form.cold': 'Cadeia fria (2–8 °C)',
    'form.submit': 'Adicionar lote',
    'form.duplicate': 'O lote {batch} já existe para o SKU {sku}.',
    'form.expired': 'Este lote já está vencido — não deve entrar no estoque.',
    'form.success': 'Lote {batch} recebido.',

    'footer.text': 'Dados fictícios, feito para estudo. Criado por',

    'product.DIP-500': 'Dipirona 500mg — 10 comprimidos',
    'product.AMX-875': 'Amoxicilina 875mg — 14 comprimidos',
    'product.INS-NPH': 'Insulina NPH 100 UI/ml — frasco-ampola',
    'product.VTC-1G': 'Vitamina C 1g — 10 comprimidos efervescentes',
    'product.SRO-500': 'Soro fisiológico 0,9% — 500ml',
  },

  fr: {
    'page.title': 'FEFO Pharma Stock — gestion des lots et des dates de péremption',
    'header.subtitle': 'Gestion des lots et des dates de péremption pour un entrepôt pharmaceutique',
    'header.reset': 'Réinitialiser les données',
    'header.language': 'Langue',

    'summary.label': 'Résumé du stock',
    'summary.batches': 'Lots',
    'summary.units': 'Unités en stock',
    'summary.expired': 'Périmés',
    'summary.critical': 'Critiques (≤ 30 j)',
    'summary.warning': 'À surveiller (≤ 90 j)',
    'summary.blocked': 'Bloqués',
    'summary.coldChain': 'Lots chaîne du froid',

    'picking.title': 'Suggestion de préparation',
    'picking.hint': "Choisissez un produit et une quantité. L'application indique les lots à prélever, selon la règle FEFO, en écartant tout ce qui ne doit pas quitter l'entrepôt.",
    'picking.product': 'Produit',
    'picking.quantity': 'Quantité',
    'picking.submit': 'Suggérer la préparation',
    'picking.take': 'Prélever <strong>{qty}</strong> du lot <strong>{batch}</strong> à l’emplacement {location} (périme le {date})',
    'picking.none': 'Aucun lot de ce produit ne peut être prélevé pour le moment.',
    'picking.missing': 'Il manque {missing} unités sur {requested} — prévenez l’équipe avant de clôturer la commande.',
    'picking.skipped': 'Écartés :',
    'picking.invalidQty': 'Saisissez un nombre entier supérieur à zéro.',

    'skip.expired': 'périmé',
    'skip.blocked': 'bloqué (contrôle qualité)',
    'skip.short shelf life': 'péremption trop proche pour être expédié',

    'table.title': 'Lots en stock',
    'table.search': 'Rechercher un produit ou un lot…',
    'table.filter': 'Filtrer par statut',
    'table.allStatuses': 'Tous les statuts',
    'table.product': 'Produit',
    'table.batch': 'Lot',
    'table.expiry': 'Péremption',
    'table.daysLeft': 'Jours restants',
    'table.qty': 'Qté',
    'table.location': 'Emplacement',
    'table.status': 'Statut',
    'table.empty': 'Aucun lot trouvé.',
    'table.block': 'Bloquer',
    'table.release': 'Débloquer',
    'table.coldTitle': 'À conserver entre 2 et 8 °C',

    'filter.critical': 'Critique (≤ 30 jours)',
    'filter.warning': 'À surveiller (≤ 90 jours)',

    'status.expired': 'Périmé',
    'status.critical': 'Critique',
    'status.warning': 'À surveiller',
    'status.ok': 'OK',
    'status.blocked': 'Bloqué',

    'days.today': "aujourd'hui",
    'days.ago': 'il y a {n} jours',
    'days.agoOne': 'il y a 1 jour',
    'days.left': '{n} jours',
    'days.leftOne': '1 jour',

    'form.title': 'Réceptionner un nouveau lot',
    'form.sku': 'Référence (SKU)',
    'form.product': 'Produit',
    'form.batch': 'Lot',
    'form.expiry': 'Date de péremption',
    'form.quantity': 'Quantité',
    'form.location': 'Emplacement',
    'form.storage': 'Stockage',
    'form.ambient': 'Température ambiante (15–30 °C)',
    'form.cold': 'Chaîne du froid (2–8 °C)',
    'form.submit': 'Ajouter le lot',
    'form.duplicate': 'Le lot {batch} existe déjà pour la référence {sku}.',
    'form.expired': 'Ce lot est déjà périmé — il ne doit pas entrer en stock.',
    'form.success': 'Lot {batch} réceptionné.',

    'footer.text': 'Données fictives, projet d’étude. Réalisé par',

    'product.DIP-500': 'Métamizole 500 mg — 10 comprimés',
    'product.AMX-875': 'Amoxicilline 875 mg — 14 comprimés',
    'product.INS-NPH': 'Insuline NPH 100 UI/ml — flacon',
    'product.VTC-1G': 'Vitamine C 1 g — 10 comprimés effervescents',
    'product.SRO-500': 'Solution saline 0,9 % — 500 ml',
  },
};

const STORAGE_KEY = 'fefo-pharma-stock:language';

// First visit: follow the browser language if it's one of ours, otherwise English.
export function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && messages[saved]) return saved;
  } catch {
    // storage blocked — just fall through to the browser language
  }
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return messages[browser] ? browser : 'en';
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // not a big deal: the choice just won't be remembered next time
  }
}

// Looks up a key and fills {placeholders}. Falls back to English, and then to
// the key itself, so a missing translation shows up on screen instead of crashing.
export function translate(lang, key, params = {}) {
  const text = messages[lang]?.[key] ?? messages.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (name in params ? params[name] : `{${name}}`));
}

export function hasTranslation(lang, key) {
  return key in (messages[lang] ?? {});
}

// Exported only for the tests, to make sure no language is missing a key.
export function allKeys(lang) {
  return Object.keys(messages[lang] ?? {});
}

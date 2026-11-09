// Relevé quotidien des soldes snack (Proxirest). N'affiche ni matricule, ni nom, ni e-mail, ni solde.
// S'arrête à l'affichage du solde : ne clique jamais sur VALIDER. Écrit /tmp/releve.json (clair, jamais publié).
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL_PARCOURS = 'https://proxirest.ma/epaiement/FR/parcours';
const email = process.env.EMAIL;
const enfants = [
  { tag: 'o', matricule: process.env.MATRICULE_OMAR },
  { tag: 'a', matricule: process.env.MATRICULE_ALI },
];

async function taper(champ, valeur) {
  await champ.click();
  await champ.fill('');
  await champ.pressSequentially(valeur, { delay: 50 });
}

async function releve(browser, { tag, matricule }) {
  const res = { tag, solde: null, etape: 'début' };
  const ctx = await browser.newContext({ viewport: { width: 450, height: 900 }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  try {
    await page.goto(URL_PARCOURS, { waitUntil: 'networkidle', timeout: 45000 });
    res.etape = 'groupe';
    await page.getByText('Voir les écoles').first().click();
    res.etape = 'école';
    await page.getByText('Descartes', { exact: true }).first().click();
    res.etape = 'recharge';
    await page.getByText('Recharger Snack').click();
    res.etape = 'matricule';
    await taper(page.getByPlaceholder('N° matricule'), matricule);
    await page.keyboard.press('Tab');
    await page.getByText('Convive trouvé').waitFor({ timeout: 20000 });
    for (let essai = 1; essai <= 3; essai++) {
      res.etape = `formulaire (essai ${essai})`;
      await taper(page.getByPlaceholder('E-mail', { exact: true }), email);
      await taper(page.getByPlaceholder('Confirmation E-mail'), email);
      await page.locator('input[type=checkbox]').check();
      await page.getByRole('button', { name: 'RECHERCHER' }).click();
      try { await page.waitForURL('**/epaiement/FR/snack', { timeout: 15000 }); break; } catch { /* nouvel essai */ }
    }
    res.etape = 'solde';
    await page.getByText('SOLDE').first().waitFor({ timeout: 20000 });
    let m = null;
    for (let t = 0; t < 20 && !m; t++) {
      const texte = await page.innerText('body');
      m = texte.match(/SOLDE\s*([0-9][0-9\s.,]*?)\s*DH/i);
      if (!m) await page.waitForTimeout(1000);
    }
    if (m) {
      const v = Number(m[1].replace(/\s/g, '').replace(',', '.'));
      if (Number.isFinite(v) && v >= 0 && v < 100000) res.solde = v;
    }
  } catch (e) {
    res.erreur = String(e.message).split('\n')[0].slice(0, 100);
  } finally {
    await ctx.close();
  }
  return res;
}

if (!email || !enfants.every(e => e.matricule)) { console.log('Secrets manquants : relevé non lancé.'); process.exit(1); }
const browser = await chromium.launch();
const sortie = {};
let tout = true;
for (const enf of enfants) {
  const r = await releve(browser, enf);
  const ok = r.solde !== null;
  tout = tout && ok;
  sortie[r.tag] = r.solde;
  console.log(`Enfant ${r.tag.toUpperCase()} : solde lu = ${ok ? 'oui' : 'non (arrêt à : ' + r.etape + (r.erreur ? ' ; ' + r.erreur : '') + ')'}`);
}
await browser.close();
if (!tout) process.exit(1);
const maintenant = new Date().toISOString();
writeFileSync('/tmp/releve.json', JSON.stringify({ d: maintenant.slice(0, 10), t: maintenant.slice(11, 16), o: sortie.o, a: sortie.a }));
console.log('Relevé écrit (chiffré à l\'étape suivante).');

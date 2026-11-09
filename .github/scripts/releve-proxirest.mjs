// Relevé de test des soldes snack (Proxirest). N'affiche ni matricule, ni nom, ni e-mail, ni solde.
// Ne clique jamais sur VALIDER : le parcours s'arrête à l'affichage du solde.
import { chromium } from 'playwright';

const URL_PARCOURS = 'https://proxirest.ma/epaiement/FR/parcours';
const email = process.env.EMAIL;
const attendus = (process.env.ATTENDUS || '').split(',').map(s => s.trim());
const enfants = [
  { tag: 'A', matricule: process.env.MATRICULE_A },
  { tag: 'B', matricule: process.env.MATRICULE_B },
];

async function taper(champ, valeur) {
  await champ.click();
  await champ.fill('');
  await champ.pressSequentially(valeur, { delay: 50 });
}

async function releve(browser, { tag, matricule }) {
  const res = { tag, parcours: false, solde: null, etape: 'début' };
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
    page.on('response', r => { if (r.url().includes('action=convive')) res.lookup = `HTTP ${r.status()}`; });
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
    const texte = await page.innerText('body');
    const m = texte.match(/SOLDE\s*([\d\s.,]+?)\s*DH/i);
    res.parcours = true;
    if (m) res.solde = m[1].replace(/\s/g, '');
  } catch (e) {
    res.erreur = String(e.message).split('\n')[0].slice(0, 100);
  } finally {
    await ctx.close();
  }
  return res;
}

const browser = await chromium.launch();
const lignes = [`Date UTC : ${new Date().toISOString()}`];
let tout = true;
for (const [i, enf] of enfants.entries()) {
  const r = await releve(browser, enf);
  const lu = r.solde !== null;
  const conforme = lu && attendus[i] !== undefined && r.solde === attendus[i];
  tout = tout && r.parcours && lu;
  lignes.push(`Enfant ${r.tag} : parcours complet = ${r.parcours ? 'oui' : 'non (arrêt à : ' + r.etape + ')'} ; solde lu = ${lu ? 'oui' : 'non'} ; conforme au relevé manuel = ${conforme ? 'oui' : 'non'}${r.lookup ? ' ; vérification matricule : ' + r.lookup : ' ; vérification matricule : aucune requête'}${r.erreur ? ' ; erreur : ' + r.erreur : ''}`);
}
await browser.close();
console.log(lignes.join('\n'));
process.exitCode = tout ? 0 : 1;

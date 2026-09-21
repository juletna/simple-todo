const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

// Exerce les fonctions réellement embarquées dans le fichier HTML autonome.
const source = readFileSync(join(__dirname, '../listechantiers.html'), 'utf8');
const graph = source.slice(source.indexOf('function setupPersonalDependencies('), source.indexOf('let dependencyEditingId='));
const scores = source.slice(source.indexOf('function pDateString('), source.indexOf('function pOptions('));
function model(tasks) {
  const context = vm.createContext({ state: { personal: tasks }, crypto: webcrypto, personalResetPending: false });
  vm.runInContext('const P_EFFORT=["S","M","L","XL"];' + graph + scores, context);
  return context;
}
const task = (id, dependsOn = [], props = {}) => ({ id, text: id, dependsOn, status: null, ...props });

test('déblocage séquentiel puis réouverture du prérequis', () => {
  const a = task('devis'), b = task('validation', ['devis']), c = task('sablage', ['validation']);
  const m = model([a, b, c]);
  assert.equal(m.pAvailabilityText(a), 'Prête');
  assert.equal(m.pAvailabilityText(b), 'Bloquée');
  a.status = 'Terminé';
  assert.equal(m.pAvailabilityText(b), 'Prête');
  assert.equal(m.pAvailabilityText(c), 'Bloquée');
  a.status = null;
  assert.equal(m.pAvailabilityText(b), 'Bloquée');
});

test('tous les prérequis sont nécessaires ; les liens absents restent bloquants', () => {
  const a = task('a', [], { status: 'Terminé' }), b = task('b'), c = task('c', ['a', 'b']);
  const m = model([a, b, c]);
  assert.equal(m.pUnmet(c).join(), 'b');
  b.status = 'Terminé';
  assert.equal(m.pUnmet(c).length, 0);
  c.dependsOn.push('absent');
  assert.equal(m.pAvailabilityText(c), 'Bloquée');
});

test('refuse les cycles directs et indirects ; termine même sur un graphe importé cyclique', () => {
  const a = task('a'), b = task('b', ['a']), c = task('c', ['b']);
  const m = model([a, b, c]);
  assert.equal(m.validDependencies('a', ['a']), false);
  assert.equal(m.validDependencies('a', ['c']), false);
  assert.equal(m.validDependencies('c', ['a', 'b']), true);
  a.dependsOn = ['c'];
  assert.equal(m.pDownstream(a).length, 2);
});

test('priorité héritée, bonus plafonné et absence de score inventé', () => {
  const a = task('devis'), b = task('validation', ['devis']);
  const c = task('pose', ['validation'], { risk: 3, urgency: 3, impact: 3, effort: 'L' });
  const m = model([a, b, c]);
  assert.equal(m.pScore(c), 22);
  assert.equal(m.pScore(b), 25);
  assert.equal(m.pScore(a), 28);
  for (let i = 0; i < 5; i++) m.state.personal.push(task('extra-' + i, ['devis']));
  assert.equal(m.pScore(a), 31);
  c.status = 'Terminé';
  assert.equal(m.pScore(a), null);
});

test('les chemins convergents ne comptent pas une tâche deux fois', () => {
  const a = task('a'), b = task('b', ['a']), c = task('c', ['a']), d = task('d', ['b', 'c']);
  const m = model([a, b, c, d]);
  assert.equal(m.pDownstream(a).length, 3);
});

test('mise à niveau des dépendances sans création ni modification de tâches privées', () => {
  const original=task('existing',['a','a',42],{text:'Tâche de test',risk:2,block:3});
  const m=model([original]);
  m.setupPersonalDependencies(m.state);
  assert.equal(m.state.personal.length,1);
  assert.equal(original.text,'Tâche de test');
  assert.equal(original.risk,2);
  assert.equal(original.dependsOn.join(),'a');
  assert.equal(original.block,undefined);
  m.setupPersonalDependencies(m.state);
  assert.equal(m.state.personal.length,1);
});

test('raccourcis datés : dimanche, fin du mois, mois suivant et retard', () => {
  const m=model([]), now=new Date(2026,8,21,12);
  assert.equal(m.pDeadlineDate(3,now),'2026-09-27');
  assert.equal(m.pDeadlineDate(2,now),'2026-09-30');
  assert.equal(m.pDeadlineDate(1,now),'2026-10-31');
  assert.equal(m.pDeadlineDate(4,now),'2026-09-20');
  assert.equal(m.pDeadlineDate(1,new Date(2026,11,31)),'2027-01-31');
  assert.equal(m.pDeadlineDate(2,new Date(2028,1,1)),'2028-02-29');
});

test('une date fixe gagne en urgence sans être repoussée au changement de période', () => {
  const m=model([]), t={date:'2026-10-15',urgency:1};
  assert.equal(m.pUrgency(t,new Date(2026,8,21)),1);
  assert.equal(m.pUrgency(t,new Date(2026,9,1)),2);
  assert.equal(m.pUrgency(t,new Date(2026,9,12)),3);
  assert.equal(m.pUrgency(t,new Date(2026,9,15,23)),3);
  assert.equal(m.pUrgency(t,new Date(2026,9,16)),4);
  assert.equal(t.date,'2026-10-15');
  assert.equal(m.pUrgency({date:'2026-11-01'},new Date(2026,9,31)),3);
});

test('aucune échéance et non renseignée restent distinctes, avec retrait de la date', () => {
  const m=model([]), t={risk:0,impact:0,effort:'S',date:'2020-01-01',urgency:4};
  m.pSetDeadline(t,0);
  assert.equal(t.date,'');
  assert.equal(m.pBaseScore(t),2);
  m.pSetDeadline(t,'');
  assert.equal(t.urgency,null);
  assert.equal(m.pBaseScore(t),null);
  t.date='2020-01-01';
  assert.equal(m.pBaseScore(t),10);
});

test('migration unique : garde les dates et qualifications, regroupe les durées courtes', () => {
  const m=model([]), data={personal:[
    {urgency:3,effort:'XS',risk:2,impact:1},
    {date:'2027-05-04',urgency:2,effort:'L'},
    {urgency:0},{urgency:null}
  ]};
  m.setupPersonalCriteria(data,new Date(2026,8,21));
  assert.equal(data.personal[0].date,'2026-09-27');
  assert.equal(data.personal[0].effort,'S');
  assert.equal(data.personal[0].risk,2);
  assert.equal(data.personal[0].impact,1);
  assert.equal(data.personal[1].date,'2027-05-04');
  assert.equal(data.personal[2].date,undefined);
  assert.equal(data.personal[3].urgency,null);
  m.setupPersonalCriteria(data,new Date(2026,9,20));
  assert.equal(data.personal[0].date,'2026-09-27');
});

test('mur dangereux : P1 sans gain, quelle que soit la durée ou les critères manquants', () => {
  const m=model([]);
  for(const effort of ['M','L','XL',null]){
    const wall=task('mur',[],{risk:3,impact:0,urgency:0,effort});
    assert.equal(m.pPriority(wall),1);
  }
  assert.equal(m.pPriority(task('mur',[],{risk:3})),1);
  assert.equal(m.pPriority(task('retard',[],{date:'2020-01-01'})),1);
  assert.equal(m.pPriority(task('inconnu')),0);
});

test('les enjeux fixent les niveaux, sans seuils de score ni quotas', () => {
  const medium=task('moyen',[],{risk:2,impact:0,urgency:0,effort:'XL'});
  const week=task('semaine',[],{risk:0,urgency:3});
  const weak=task('faible',[],{risk:1});
  const month=task('mois',[],{urgency:2});
  const benefit=task('gain',[],{impact:3});
  const low=task('petit',[],{risk:0,urgency:0,impact:1,effort:'S'});
  const m=model([medium,week,weak,month,benefit,low]);
  for(const [t,p] of [[medium,2],[week,2],[weak,3],[month,3],[benefit,3],[low,4]])assert.equal(m.pPriority(t),p);
  m.state.personal=[low];
  assert.equal(m.pPriority(low),4);
  assert.equal(m.pSorted([low])[0].id,'petit');
});

test('la priorité de sécurité se transmet aux prérequis même sans score', () => {
  const prep=task('préparer'),wall=task('mur',['préparer'],{risk:3});
  const m=model([prep,wall]);
  assert.equal(m.pScore(prep),null);
  assert.equal(m.pPriority(prep),1);
  assert.match(m.pPriorityReason(prep),/héritée/);
  wall.status='Terminé';
  assert.equal(m.pPriority(prep),0);
  wall.status=null;
  assert.equal(m.pPriority(prep),1);
});

test('tri : priorité avant score, risque avant gain puis durée à enjeux égaux', () => {
  const base={risk:3,impact:0,urgency:0};
  const short=task('mur court',[],{...base,effort:'M'});
  const long=task('mur long',[],{...base,effort:'XL'});
  const incomplete=task('danger incomplet',[],{risk:3});
  const late=task('retard sans risque',[],{risk:0,impact:3,date:'2020-01-01',effort:'S'});
  const medium=task('moyen à gros score',[],{risk:2,urgency:3,impact:3,effort:'S'});
  const done=task('fini',[],{...base,effort:'S',status:'Terminé'});
  const unknown=task('inconnu');
  const tasks=[medium,long,unknown,late,short,done,incomplete],m=model(tasks);
  assert.ok(m.pScore(medium)>m.pScore(short));
  assert.equal(m.pSorted(tasks).map(t=>t.id).join('|'),[short,long,incomplete,late,medium,unknown,done].map(t=>t.id).join('|'));
  assert.equal(m.pSorted([long,short]).map(t=>t.id).join('|'),'mur court|mur long');
});

test('publication : aucun exemple embarqué au premier lancement', () => {
  const context=vm.createContext({state:{tasks:[]}});
  const pro=source.slice(source.indexOf('function seed(){'),source.indexOf('/* ============ espace personnel'));
  const personal=source.slice(source.indexOf('function personalSeed(){'),source.indexOf('// Les tâches sont'));
  vm.runInContext(pro+personal,context);
  context.seed();
  assert.equal(context.state.tasks.length,0);
  assert.equal(context.personalSeed().length,0);
});

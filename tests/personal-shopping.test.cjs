const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, '../listechantiers.html'), 'utf8');
const strings = source.slice(source.indexOf('function cleanSection('), source.indexOf('function personalSections('));
const functions = source.slice(source.indexOf('function pShoppingItems('), source.indexOf('function pShoppingSummary('));
function model(tasks = []) {
  const context = vm.createContext({ state: { personal: tasks } });
  vm.runInContext(strings + functions, context);
  return context;
}
const item = (article, quantity, store = 'Bricolage', city = 'Ville A', bought = false) => ({ article, quantity, store, city, bought });

test('N articles par tâche, regroupés entre domaines avec leurs tâches sources', () => {
  const tasks = [
    { id: 'sdb', section: 'Domaine A', shopping: [item('Silicone blanc', 1), item('Vis inox', 12)] },
    { id: 'plinthe', section: 'Maison', shopping: [item('Silicone blanc', 1)] }
  ];
  const m = model(tasks), groups = m.pShoppingGroups();
  assert.equal(groups.length, 2);
  const silicone = groups.find(g => g.article === 'Silicone blanc');
  assert.equal(silicone.quantity, 2);
  assert.equal(silicone.lines.length, 2);
  silicone.lines.forEach(({ item }) => { item.bought = true; });
  assert.equal(tasks[0].shopping[0].bought, true);
  assert.equal(tasks[1].shopping[0].bought, true);
  assert.equal(m.pShoppingGroups().length, 1);
  assert.equal(m.pShoppingGroups(tasks, true).length, 1);
});

test('ne fusionne pas les variantes, magasins ou villes différents', () => {
  const m = model([{ shopping: [
    item('Silicone blanc', 1), item('Silicone transparent', 1),
    item('Silicone blanc', 1, 'Autre magasin'), item('Silicone blanc', 1, 'Bricolage', 'Ville B')
  ] }]);
  assert.equal(m.pShoppingGroups().length, 4);
});

test('normalise espaces et casse sans confondre les séparateurs dans les libellés', () => {
  const m = model([{ shopping: [item(' Silicone  blanc ', 1), item('silicone blanc', 2, ' bricolage ', 'ville a')] }]);
  assert.equal(m.pShoppingGroups().length, 1);
  assert.equal(m.pShoppingGroups()[0].quantity, 3);
  m.state.personal = [{ shopping: [item('A|B', 1, 'C'), item('A', 1, 'B|C')] }];
  assert.equal(m.pShoppingGroups().length, 2);
});

test('quantités facultatives : ne suppose pas une unité pour les lignes sans quantité', () => {
  const m = model([{ shopping: [item('Silicone', 2), item('Silicone', null)] }]);
  const group = m.pShoppingGroups()[0];
  assert.equal(group.quantity, 2);
  assert.equal(group.unspecified, 1);
  assert.match(m.pShoppingQuantity(group), /2 \+ 1 quantité/);
  m.state.personal = [{ shopping: [item('Fil', 0.1), item('Fil', 0.2)] }];
  assert.equal(m.pShoppingQuantity(m.pShoppingGroups()[0]), '0,3');
});

test('suggestions issues des lignes restantes, y compris achetées, et des brouillons', () => {
  const tasks = [{ id: 'a', shopping: [item('Vis', 12, 'Magasin unique', 'Ville A', true)] }, { id: 'b', shopping: [] }];
  const m = model(tasks);
  assert.equal(m.pShoppingSuggestions('article').join(), 'Vis');
  assert.equal(m.pShoppingSuggestions('article', tasks, 'a', []).length, 0);
  assert.equal(m.pShoppingSuggestions('article', tasks, 'b', [item(' vis ', 1)]).length, 1);
  tasks[0].shopping = [];
  assert.equal(m.pShoppingSuggestions('store').length, 0);
  assert.equal(m.pShoppingSuggestions('city').length, 0);
});

test('anciennes sauvegardes sans achats et tâches terminées', () => {
  const m = model([{ id: 'legacy' }, { status: 'Terminé', shopping: [item('Vis', 2)] }]);
  assert.equal(m.pShoppingGroups().length, 1);
  assert.equal(m.pShoppingItems(m.state.personal[0]).length, 0);
});

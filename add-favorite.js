#!/usr/bin/env node
/*
  Favorites Data CLI - add-favorite.js
  用途：交互式添加或删除收藏条目到 source/js/favorites-data-complete.js
  运行：node add-favorite.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'source/js/favorites-data-complete.js');

// --- 通用辅助函数 (与 add-music.js 类似) ---
function createRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

function isEmpty(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`找不到数据文件: ${DATA_FILE}`);
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  try {
    vm.runInContext(raw, context, { filename: DATA_FILE });
  } catch (e) {
    throw new Error(`解析数据文件失败：${e.message}`);
  }
  const data = context.window.favoritesData;
  if (!data || typeof data !== 'object') {
    throw new Error('数据文件中未找到 window.favoritesData 对象');
  }
  return { data, raw };
}

function saveData(data) {
  if (fs.existsSync(DATA_FILE)) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const backupPath = DATA_FILE.replace(/\.js$/, `.backup-${ts}.js`);
    fs.copyFileSync(DATA_FILE, backupPath);
    console.log(`已备份当前数据文件到: ${backupPath}`);
  }
  const header = '// 完整的收藏夹网站数据 - 多级分类结构\n';
  const content = 'window.favoritesData = ' + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(DATA_FILE, header + content, 'utf8');
}

function listChoices(title, items) {
  console.log(`\n${title}`);
  items.forEach((it, idx) => {
    console.log(`  [${idx + 1}] ${it}`);
  });
}

async function pickFromList(rl, title, items, allowNewLabel) {
  const extended = items.slice();
  if (allowNewLabel) extended.push(allowNewLabel);
  listChoices(title, extended);
  while (true) {
    const ans = await ask(rl, '请输入序号: ');
    const n = Number(ans);
    if (Number.isInteger(n) && n >= 1 && n <= extended.length) {
      return { index: n - 1, label: extended[n - 1], isNew: allowNewLabel && n === extended.length };
    }
    console.log('输入无效，请输入列表中的序号。');
  }
}

async function confirm(rl, msg) {
  while (true) {
    const ans = (await ask(rl, `${msg} (y/N): `)).toLowerCase();
    if (ans === 'y' || ans === 'yes') return true;
    if (ans === '' || ans === 'n' || ans === 'no') return false;
    console.log('请输入 y 或 n。');
  }
}

async function inputRequired(rl, label, validator) {
  while (true) {
    const ans = await ask(rl, `${label}: `);
    if (!isEmpty(ans) && (!validator || validator(ans))) return ans;
    console.log('该字段为必填，请重新输入。');
  }
}

async function inputOptional(rl, label, validator) {
  while (true) {
    const ans = await ask(rl, `${label} (可选，直接回车跳过): `);
    if (isEmpty(ans)) return '';
    if (!validator || validator(ans)) return ans;
    console.log('输入不合法，请重新输入。');
  }
}

function isURL(s) {
  return /^https?:\/\//i.test(s);
}

// --- 编辑/移动/清理辅助 ---
async function promptEditString(rl, label, current, options = {}) {
  const { required = false, validator = null } = options;
  while (true) {
    const ans = await ask(rl, `${label} [当前: ${current ?? ''}] (回车保留): `);
    if (ans === '') {
      if (required && (current === undefined || current === null || String(current).trim() === '')) {
        console.log('该字段为必填，请输入新值。');
        continue;
      }
      return current;
    }
    if (validator && !validator(ans)) {
      console.log('输入不合法，请重新输入。');
      continue;
    }
    return ans;
  }
}

function walkAllNodes(data, cb) {
  Object.keys(data).forEach(mainKey => {
    const main = data[mainKey];
    function recur(node, path) {
      cb(node, path);
      if (node.subcategories && typeof node.subcategories === 'object') {
        Object.keys(node.subcategories).forEach(subKey => {
          const sub = node.subcategories[subKey];
          recur(sub, [...path, sub.title || subKey]);
        });
      }
    }
    recur(main, [main.title || mainKey]);
  });
}


// --- 收藏夹特定逻辑 ---

// 递归选择分类，直到找到 sites 数组
async function selectCategoryRecursive(rl, node, breadcrumb, allowNew) {
  if (node.sites) {
    return { targetNode: node, breadcrumb };
  }

  if (!node.subcategories || typeof node.subcategories !== 'object') {
    if (allowNew) {
      const createSites = await confirm(rl, '该分类下没有子分类，是否直接在此创建收藏条目？');
      if (createSites) {
        node.sites = [];
        return { targetNode: node, breadcrumb };
      }
    }
    throw new Error('无法找到可添加条目的位置。');
  }

  const subKeys = Object.keys(node.subcategories);
  const choice = await pickFromList(
    rl,
    `当前位置: ${breadcrumb} -> 请选择子分类：`,
    subKeys.map(k => node.subcategories[k].title || k),
    allowNew ? '在此层级下新建子分类' : null
  );

  if (choice.isNew) {
    const newKey = await inputRequired(rl, '新子分类的键 (英文，例: algorithm, frontend)');
    if (node.subcategories[newKey]) throw new Error('该键已存在！');
    const newTitle = await inputRequired(rl, '新子分类的显示名称 (例: 算法刷题)');
    const newIcon = await inputOptional(rl, '新子分类的图标 (可选)');
    node.subcategories[newKey] = { title: newTitle, icon: newIcon || undefined };
    Object.keys(node.subcategories[newKey]).forEach(k => node.subcategories[newKey][k] === undefined && delete node.subcategories[newKey][k]);
    const hasSub = await confirm(rl, '这个新子分类是否继续包含下一级子分类？');
    if (hasSub) {
      node.subcategories[newKey].subcategories = {};
    } else {
      node.subcategories[newKey].sites = [];
    }
    return selectCategoryRecursive(rl, node.subcategories[newKey], `${breadcrumb} -> ${newTitle}`, allowNew);
  }

  const chosenKey = subKeys[choice.index];
  const nextNode = node.subcategories[chosenKey];
  return selectCategoryRecursive(rl, nextNode, `${breadcrumb} -> ${nextNode.title || chosenKey}`, allowNew);
}

async function addFlow(rl, data) {
  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择要添加到哪个主分类：', mainKeys.map(k => data[k].title || k), '新建主分类');

  let startNode, startKey;
  if (mainChoice.isNew) {
    startKey = await inputRequired(rl, '新主分类的键 (英文，例: study, dev)');
    if (data[startKey]) throw new Error('该键已存在！');
    const newTitle = await inputRequired(rl, '新主分类的显示名称 (例: 学习充电)');
    data[startKey] = { title: newTitle, subcategories: {} };
    startNode = data[startKey];
  } else {
    startKey = mainKeys[mainChoice.index];
    startNode = data[startKey];
  }

  const { targetNode, breadcrumb } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, true);

  while (true) {
    console.log(`\n将在 ${breadcrumb} 中添加新的收藏条目：`);
    const name = await inputRequired(rl, '网站名称 (name)');
    const url = await inputRequired(rl, '网址 (url)', isURL);
    const description = await inputRequired(rl, '描述 (description)');
    const tags = await inputRequired(rl, '标签 (tags, 空格分隔)');
    const icon = await inputOptional(rl, '图标 (icon, 可选)');

    const newItem = { name, url, description, tags };
    if (!isEmpty(icon)) newItem.icon = icon;

    console.log('\n即将添加:');
    console.log(JSON.stringify(newItem, null, 2));
    if (!await confirm(rl, '确认添加吗？')) {
      if (!await confirm(rl, '已取消，是否继续添加其他条目？')) break;
      continue;
    }

    if (!Array.isArray(targetNode.sites)) targetNode.sites = [];
    targetNode.sites.push(newItem);
    saveData(data);
    console.log('✅ 添加成功！');

    if (!await confirm(rl, '是否继续在当前分类下添加？')) break;
  }
}

// --- 增强功能：删除 ---

// 递归获取所有条目及其引用，用于搜索
function getAllSitesWithRefs(data) {
  const allSites = [];
  function recurse(node, path) {
    if (node.sites && Array.isArray(node.sites)) {
      node.sites.forEach(site => {
        allSites.push({
          site,
          path: path.join(' -> '),
          parentArray: node.sites // 直接引用父数组
        });
      });
    }
    if (node.subcategories && typeof node.subcategories === 'object') {
      for (const key in node.subcategories) {
        recurse(node.subcategories[key], [...path, node.subcategories[key].title || key]);
      }
    }
  }
  for (const key in data) {
    recurse(data[key], [data[key].title || key]);
  }
  return allSites;
}

// 按关键字搜索并删除
async function searchAndDeleteFlow(rl, data) {
  const keyword = await inputRequired(rl, '请输入搜索关键字:');
  const lowerKeyword = keyword.toLowerCase();

  const allSites = getAllSitesWithRefs(data);
  const results = allSites.filter(({ site }) =>
    (site.name && site.name.toLowerCase().includes(lowerKeyword)) ||
    (site.description && site.description.toLowerCase().includes(lowerKeyword)) ||
    (site.tags && site.tags.toLowerCase().includes(lowerKeyword)) ||
    (site.url && site.url.toLowerCase().includes(lowerKeyword))
  );

  if (results.length === 0) {
    console.log('未找到匹配的收藏条目。');
    return;
  }

  console.log(`\n找到 ${results.length} 个匹配结果：`);
  results.forEach((r, i) => {
    console.log(`  [${i + 1}] ${r.site.name}`);
    console.log(`      路径: ${r.path}`);
    console.log(`      描述: ${r.site.description}`);
  });

  const ans = await ask(rl, "\n输入要删除的序号 (逗号分隔), 'a' 全删, 'q' 退出: ");
  if (ans.toLowerCase() === 'q') return;

  const indexes = ((input, max) => {
    if (!input) return null;
    if (input.toLowerCase() === 'a') return Array.from({ length: max }, (_, i) => i + 1);
    const parts = input.split(',').map(p => Number(p.trim())).filter(n => Number.isInteger(n));
    return Array.from(new Set(parts)).filter(n => n >= 1 && n <= max).sort((a, b) => b - a);
  })(ans, results.length);

  if (!indexes) {
    console.log('输入无效。');
    return;
  }

  console.log('\n即将删除:');
  indexes.slice().sort((a,b)=>a-b).forEach(i => console.log(`  [${i}] ${results[i - 1].site.name}`));

  if (await confirm(rl, '确认删除吗？')) {
    indexes.forEach(i => {
      const itemToDelete = results[i - 1];
      const indexInParent = itemToDelete.parentArray.indexOf(itemToDelete.site);
      if (indexInParent > -1) {
        itemToDelete.parentArray.splice(indexInParent, 1);
      }
    });
    saveData(data);
    console.log(`✅ 已删除 ${indexes.length} 条。`);
  }
}

// 按分类浏览并删除
async function browseAndDeleteFlow(rl, data) {
  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择要从哪个主分类删除：', mainKeys.map(k => data[k].title || k));
  const startKey = mainKeys[mainChoice.index];
  const startNode = data[startKey];

  const { targetNode, breadcrumb } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, false);

  if (!targetNode.sites || targetNode.sites.length === 0) {
    console.log(`分类 ${breadcrumb} 下没有可删除的条目。`);
    return;
  }

  while (true) {
    console.log(`\n分类 ${breadcrumb} 下有 ${targetNode.sites.length} 个条目：`);
    targetNode.sites.forEach((s, i) => console.log(`  [${i + 1}] ${s.name} - ${s.description}`));

    const ans = await ask(rl, "\n输入删除序号 (逗号分隔), 'a' 全删, 'q' 退出: ");
    if (ans.toLowerCase() === 'q') break;

    const indexes = ((input, max) => {
      if (!input) return null;
      if (input.toLowerCase() === 'a') return Array.from({ length: max }, (_, i) => i + 1);
      const parts = input.split(',').map(p => Number(p.trim())).filter(n => Number.isInteger(n));
      return Array.from(new Set(parts)).filter(n => n >= 1 && n <= max).sort((a, b) => b - a);
    })(ans, targetNode.sites.length);

    if (!indexes) {
      console.log('输入无效。');
      continue;
    }

    console.log('\n即将删除:');
    indexes.slice().sort((a,b)=>a-b).forEach(i => console.log(`  [${i}] ${targetNode.sites[i - 1].name}`));

    if (await confirm(rl, '确认删除吗？')) {
      indexes.forEach(i => targetNode.sites.splice(i - 1, 1));
      saveData(data);
      console.log(`✅ 已删除 ${indexes.length} 条。`);
    }

    if (targetNode.sites.length === 0 || !await confirm(rl, '是否继续在本分类下删除？')) break;
  }
}

// --- 编辑收藏 ---
async function editOneFavorite(rl, site) {
  site.name = await promptEditString(rl, '名称 (name)', site.name, { required: true });
  site.url = await promptEditString(rl, '网址 (url)', site.url, { required: true, validator: isURL });
  site.description = await promptEditString(rl, '描述 (description)', site.description, { required: true });
  site.tags = await promptEditString(rl, '标签 (tags 空格分隔)', site.tags, { required: true });
  site.icon = await promptEditString(rl, '图标 (icon)', site.icon || '', {});
}

async function browseAndEditFlow(rl, data) {
  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择要从哪个主分类编辑：', mainKeys.map(k => data[k].title || k));
  const startKey = mainKeys[mainChoice.index];
  const startNode = data[startKey];

  const { targetNode, breadcrumb } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, false);
  const sites = targetNode.sites || (targetNode.sites = []);
  if (sites.length === 0) { console.log(`分类 ${breadcrumb} 下暂无条目。`); return; }
  sites.forEach((s,i)=>console.log(`  [${i+1}] ${s.name} - ${s.description}`));
  const idxStr = await ask(rl, '请输入要编辑的序号：');
  const idx = Number(idxStr);
  if (!Number.isInteger(idx) || idx < 1 || idx > sites.length) { console.log('输入无效。'); return; }
  const site = sites[idx - 1];
  console.log('\n当前条目：');
  console.log(JSON.stringify(site, null, 2));
  await editOneFavorite(rl, site);
  console.log('\n修改后：');
  console.log(JSON.stringify(site, null, 2));
}

async function searchAndEditFlow(rl, data) {
  const keyword = await inputRequired(rl, '请输入搜索关键字:');
  const q = keyword.toLowerCase();
  const all = getAllSitesWithRefs(data);
  const results = all.filter(({ site }) =>
    (site.name && site.name.toLowerCase().includes(q)) ||
    (site.description && site.description.toLowerCase().includes(q)) ||
    (site.tags && site.tags.toLowerCase().includes(q)) ||
    (site.url && site.url.toLowerCase().includes(q)));
  if (results.length === 0) { console.log('未找到匹配条目。'); return; }
  results.forEach((r,i)=>console.log(`  [${i+1}] ${r.site.name} | ${r.path}`));
  const idxStr = await ask(rl, '请输入要编辑的序号：');
  const idx = Number(idxStr);
  if (!Number.isInteger(idx) || idx < 1 || idx > results.length) { console.log('输入无效。'); return; }
  const site = results[idx - 1].site;
  console.log('\n当前条目：');
  console.log(JSON.stringify(site, null, 2));
  await editOneFavorite(rl, site);
  console.log('\n修改后：');
  console.log(JSON.stringify(site, null, 2));
}

async function editFlow(rl, data) {
  const pick = await pickFromList(rl, '请选择编辑方式：', ['按分类浏览编辑', '按关键字搜索编辑', '返回主菜单']);
  if (pick.index === 0) await browseAndEditFlow(rl, data);
  else if (pick.index === 1) await searchAndEditFlow(rl, data);
}

// --- 移动收藏 ---
async function moveFlow(rl, data) {
  const sourcePick = await pickFromList(rl, '请选择选择来源方式：', ['按分类选择', '按关键字搜索', '取消']);
  let selected = [];
  if (sourcePick.index === 0) {
    const mainKeys = Object.keys(data);
    const mainChoice = await pickFromList(rl, '请选择来源主分类：', mainKeys.map(k => data[k].title || k));
    const startKey = mainKeys[mainChoice.index];
    const startNode = data[startKey];
    const { targetNode } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, false);
    const sites = targetNode.sites || (targetNode.sites = []);
    if (sites.length === 0) { console.log('该来源分类无条目。'); return; }
    sites.forEach((s,i)=>console.log(`  [${i+1}] ${s.name} - ${s.description}`));
    const ans = await ask(rl, "输入要移动的序号（逗号分隔），或 'a' 全选： ");
    const idxs = (function(input, max){
      if (!input) return null; if (input.toLowerCase()==='a') return Array.from({length:max},(_,i)=>i+1);
      const parts = input.split(',').map(p=>Number(p.trim())).filter(n=>Number.isInteger(n));
      return Array.from(new Set(parts)).filter(n=>n>=1&&n<=max).sort((a,b)=>b-a);
    })(ans, sites.length);
    if (!idxs) { console.log('输入无效。'); return; }
    selected = idxs.map(i => ({ site: sites[i-1], parentArray: sites }));
  } else if (sourcePick.index === 1) {
    const keyword = await inputRequired(rl, '请输入搜索关键字:');
    const q = keyword.toLowerCase();
    const all = getAllSitesWithRefs(data);
    const results = all.filter(({ site }) =>
      (site.name && site.name.toLowerCase().includes(q)) ||
      (site.description && site.description.toLowerCase().includes(q)) ||
      (site.tags && site.tags.toLowerCase().includes(q)) ||
      (site.url && site.url.toLowerCase().includes(q)));
    if (results.length === 0) { console.log('未找到匹配条目。'); return; }
    results.forEach((r,i)=>console.log(`  [${i+1}] ${r.site.name} | ${r.path}`));
    const ans = await ask(rl, "输入要移动的序号（逗号分隔），或 'a' 全选： ");
    const idxs = (function(input, max){
      if (!input) return null; if (input.toLowerCase()==='a') return Array.from({length:max},(_,i)=>i+1);
      const parts = input.split(',').map(p=>Number(p.trim())).filter(n=>Number.isInteger(n));
      return Array.from(new Set(parts)).filter(n=>n>=1&&n<=max).sort((a,b)=>b-a);
    })(ans, results.length);
    if (!idxs) { console.log('输入无效。'); return; }
    selected = idxs.map(i => ({ site: results[i-1].site, parentArray: results[i-1].parentArray }));
  } else { return; }

  // 目标分类
  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择目标主分类：', mainKeys.map(k => data[k].title || k), '新建主分类');
  let startNode, startKey;
  if (mainChoice.isNew) {
    startKey = await inputRequired(rl, '新主分类的键 (英文)');
    if (data[startKey]) { console.log('该键已存在。'); return; }
    const newTitle = await inputRequired(rl, '新主分类的显示名称');
    data[startKey] = { title: newTitle, subcategories: {} };
    startNode = data[startKey];
  } else { startKey = mainKeys[mainChoice.index]; startNode = data[startKey]; }
  const { targetNode, breadcrumb } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, true);

  console.log(`\n将移动 ${selected.length} 条到：${breadcrumb}`);
  if (!await confirm(rl, '确认移动吗？')) return;
  selected.forEach(({ site, parentArray }) => {
    const pos = parentArray.indexOf(site);
    if (pos > -1) parentArray.splice(pos, 1);
    (targetNode.sites || (targetNode.sites = [])).push(site);
  });
  saveData(data);
  console.log('✅ 移动完成！');
}

// --- 清理空分类/子分类 ---
async function cleanEmptyFlow(rl, data) {
  function isNodeEmpty(node) {
    const hasSites = Array.isArray(node.sites) && node.sites.length > 0;
    let hasSubs = false;
    if (node.subcategories && typeof node.subcategories === 'object') {
      Object.keys(node.subcategories).forEach(k => { if (node.subcategories[k]) hasSubs = true; });
    }
    return !hasSites && !hasSubs;
  }
  // 递归清理
  function cleanNode(node) {
    let removed = 0;
    if (node.subcategories && typeof node.subcategories === 'object') {
      Object.keys(node.subcategories).forEach(k => {
        removed += cleanNode(node.subcategories[k]);
        if (isNodeEmpty(node.subcategories[k])) { delete node.subcategories[k]; removed++; }
      });
      if (Object.keys(node.subcategories).length === 0) delete node.subcategories;
    }
    if (Array.isArray(node.sites) && node.sites.length === 0) delete node.sites;
    return removed;
  }
  let removedSubs = 0; let removedMain = 0;
  Object.keys(data).forEach(mainKey => { removedSubs += cleanNode(data[mainKey]); });
  const removeMain = await confirm(rl, '是否删除“完全为空”的主分类？');
  if (removeMain) {
    Object.keys(data).forEach(mainKey => { if (isNodeEmpty(data[mainKey])) { delete data[mainKey]; removedMain++; } });
  }
  saveData(data);
  console.log(`✅ 清理完成！删除空子分类 ${removedSubs} 个${removeMain ? `，删除空主分类 ${removedMain} 个` : ''}。`);
}

// 删除操作的入口函数
async function deleteFlow(rl, data) {
  const choice = await pickFromList(rl, '请选择删除方式：', ['按分类浏览删除', '按关键字搜索删除', '返回主菜单']);
  if (choice.index === 0) {
    await browseAndDeleteFlow(rl, data);
  } else if (choice.index === 1) {
    await searchAndDeleteFlow(rl, data);
  }
}

// --- 批量导入（CSV/JSON） ---
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  const splitCSV = (line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => {
    let t = s.trim();
    if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1).replace(/""/g, '"');
    return t;
  });
  const header = splitCSV(lines[0]);

  const rows = lines.slice(1).map(splitCSV);
  const idxOf = (name) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const idx = {
    name: idxOf('name'),
    url: idxOf('url'),
    description: idxOf('description'),
    tags: idxOf('tags'),
    icon: idxOf('icon')
  };
  const requiredMissing = ['name','url','description','tags'].some(k => idx[k] === -1);
  if (requiredMissing) throw new Error('CSV 必须包含列：name, url, description, tags（icon 可选）');
  const items = [];
  rows.forEach(cols => {
    const obj = {
      name: cols[idx.name] || '',
      url: cols[idx.url] || '',
      description: cols[idx.description] || '',
      tags: cols[idx.tags] || ''
    };
    if (idx.icon !== -1 && cols[idx.icon]) obj.icon = cols[idx.icon];
    if (obj.name && isURL(obj.url) && obj.description && obj.tags) items.push(obj);
  });
  return items;
}

async function importFlow(rl, data) {
  const filePath = await inputRequired(rl, '导入文件路径 (CSV/JSON)');
  if (!fs.existsSync(filePath)) { console.log('文件不存在。'); return; }
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');
  let items = [];
  try {
    if (ext === '.json') {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error('JSON 顶层应为数组');
      items = arr.map(x => ({
        name: x.name || '',
        url: x.url || '',
        description: x.description || '',
        tags: x.tags || '',
        icon: x.icon,
      })).filter(o => o.name && isURL(o.url) && o.description && o.tags);
    } else if (ext === '.csv') {
      items = parseCSV(raw);
    } else { console.log('仅支持 .csv 或 .json 文件。'); return; }
  } catch (e) { console.log('解析失败：' + e.message); return; }

  if (items.length === 0) { console.log('未解析到有效条目。'); return; }
  console.log(`\n解析到 ${items.length} 条有效条目，预览前 5 条：`);
  items.slice(0,5).forEach((it,i)=>console.log(`  [${i+1}] ${it.name} - ${it.url}`));

  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择导入到哪个主分类：', mainKeys.map(k => data[k].title || k), '新建主分类');
  let startNode, startKey;
  if (mainChoice.isNew) {
    startKey = await inputRequired(rl, '新主分类的键 (英文)');
    if (data[startKey]) { console.log('该键已存在。'); return; }
    const newTitle = await inputRequired(rl, '新主分类的显示名称');
    data[startKey] = { title: newTitle, subcategories: {} };
    startNode = data[startKey];
  } else { startKey = mainKeys[mainChoice.index]; startNode = data[startKey]; }

  const { targetNode, breadcrumb } = await selectCategoryRecursive(rl, startNode, startNode.title || startKey, true);
  const targetSites = targetNode.sites || (targetNode.sites = []);

  const dedupPick = await pickFromList(rl, '请选择导入去重策略：', ['按 URL', '按 名称+描述', '不去重']);
  function keyOf(item) {
    if (dedupPick.index === 0) return `url:${String(item.url).toLowerCase()}`;
    if (dedupPick.index === 1) return `nd:${item.name}||${item.description}`.toLowerCase();
    return `idx:${Math.random()}`;
  }
  const existingKeys = new Set(targetSites.map(keyOf));
  const uniqueItems = [];
  const seen = new Set();
  items.forEach(it => {
    const k = keyOf(it);
    if (dedupPick.index !== 2 && (existingKeys.has(k) || seen.has(k))) return;
    seen.add(k);
    uniqueItems.push(it);
  });

  console.log(`\n即将导入到：${breadcrumb}`);
  const count = uniqueItems.length;
  if (count === 0) { console.log('根据去重策略，无可导入的新条目。'); return; }
  if (!await confirm(rl, `确认导入 ${count} 条吗？`)) { console.log('已取消导入。'); return; }

  uniqueItems.forEach(it => targetSites.push(it));
  saveData(data);
  console.log('✅ 批量导入完成！');
}


// --- 主函数 ---
(async function main() {
  const rl = createRL();
  try {
    const { data } = loadData();
    const action = await pickFromList(rl, '请选择操作：', [
      '添加收藏',
      '删除收藏',
      '编辑收藏',
      '移动收藏',
      '清理空分类',
      '批量导入（CSV/JSON）',
      '退出'
    ]);

    switch (action.index) {
      case 0: await addFlow(rl, data); break;
      case 1: await deleteFlow(rl, data); break;
      case 2: await editFlow(rl, data); break;
      case 3: await moveFlow(rl, data); break;
      case 4: await cleanEmptyFlow(rl, data); break;
      case 5: await importFlow(rl, data); break;
      default: console.log('已退出。'); break;
    }

  } catch (err) {
    console.error('\n❌ 出错：', err.message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
})();


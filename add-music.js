#!/usr/bin/env node
/*
  Music Share Data CLI - add-music.js
  用途：交互式添加音乐条目到 source/js/music-share-data.js
  运行：node add-music.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'source/js/music-share-data.js');

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
  // 在安全上下文中执行，读取 window.musicShareData
  const context = { window: {} };
  vm.createContext(context);
  try {
    vm.runInContext(raw, context, { filename: 'music-share-data.js' });
  } catch (e) {
    throw new Error(`解析数据文件失败：${e.message}`);
  }
  const data = context.window.musicShareData;
  if (!data || typeof data !== 'object') {
    throw new Error('数据文件中未找到 window.musicShareData 对象');
  }
  return { data, raw };
}

function saveData(data) {
  // 写入前创建时间戳备份
  if (fs.existsSync(DATA_FILE)) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const backupPath = DATA_FILE.replace(/\.js$/, `.backup-${ts}.js`);
    const current = fs.readFileSync(DATA_FILE, 'utf8');
    fs.writeFileSync(backupPath, current, 'utf8');
    console.log(`已备份当前数据文件到: ${backupPath}`);
  }
  // 以尽量保持结构的方式回写：导出为 JSON + 包装
  const header = '// Music Share Data\n';
  const content = 'window.musicShareData = ' + JSON.stringify(data, null, 2) + ';\n';
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


// 列出并选择要删除的条目
function printSitesList(sites) {
  sites.forEach((s, i) => {
    const title = s.title || '(无标题)';
    const artist = s.artist ? ` - ${s.artist}` : '';
    const album = s.album ? ` - ${s.album}` : '';
    console.log(`  [${i + 1}] ${title}${artist}${album}`);
  });
}

function parseIndexInput(input, max) {
  if (!input) return null;
  if (input.toLowerCase() === 'a') {
    return Array.from({ length: max }, (_, i) => i + 1);
  }
  const parts = input.split(',').map(p => Number(p.trim())).filter(n => Number.isInteger(n));
  const valid = Array.from(new Set(parts)).filter(n => n >= 1 && n <= max).sort((a, b) => b - a);
  return valid.length ? valid : null;
}

async function browseDeleteFlow(rl, data) {
  const mainKeys = Object.keys(data);
  if (mainKeys.length === 0) {
    console.log('当前没有任何主分类，无法执行删除。');
    return;
  }

  const mainPick = await pickFromList(
    rl,
    '请选择要从哪个主分类删除：',
    mainKeys.map((k) => `${k} (${data[k].title || ''})`)
  );
  const chosenMainKey = mainKeys[mainPick.index];
  const mainNode = data[chosenMainKey];

  let targetSites;
  let chosenSubKey = '';
  if (mainNode.subcategories && typeof mainNode.subcategories === 'object') {
    const subKeys = Object.keys(mainNode.subcategories);
    if (subKeys.length === 0) {
      console.log('该主分类暂无子分类。');
      return;
    }
    const subPick = await pickFromList(
      rl,
      `主分类 ${chosenMainKey} -> 请选择子分类以删除条目：`,
      subKeys.map((k) => `${k} (${mainNode.subcategories[k].title || ''})`)
    );
    chosenSubKey = subKeys[subPick.index];
    targetSites = mainNode.subcategories[chosenSubKey].sites;
  } else {
    targetSites = mainNode.sites;
  }

  if (!Array.isArray(targetSites) || targetSites.length === 0) {
    console.log('该分类下暂无可删除的条目。');
    return;
  }

  console.log(`\n共有 ${targetSites.length} 条音乐：`);
  printSitesList(targetSites);

  while (true) {
    const ans = await ask(rl, "\n请输入要删除的序号（支持逗号分隔），输入 'a' 全部删除，或 'q' 取消： ");
    if (ans.toLowerCase() === 'q') {
      console.log('已取消删除操作。');
      return;
    }
    const indexes = parseIndexInput(ans, targetSites.length);
    if (!indexes) {
      console.log('输入无效，请重新输入。');
      continue;
    }

    console.log('\n即将删除以下条目：');
    indexes.slice().sort((a,b)=>a-b).forEach(i => {
      const s = targetSites[i - 1];
      console.log(`  [${i}] ${s.title || '(无标题)'} - ${s.artist || ''} - ${s.album || ''}`);
    });

    const ok = await confirm(rl, '确认删除以上条目吗？');
    if (!ok) {
      const again = await confirm(rl, '是否重新选择删除条目？');
      if (!again) return;
      continue;
    }

    // 按索引降序删除，避免重排影响
    indexes.forEach(i => targetSites.splice(i - 1, 1));

    saveData(data);
    console.log(`\n✅ 已删除 ${indexes.length} 条。`);

    if (targetSites.length === 0) {
      console.log('当前分类已无条目。');
      return;
    }
    const more = await confirm(rl, '是否继续删除其他条目？');
    if (!more) return;
    console.log('\n剩余条目：');
    printSitesList(targetSites);
  }
}

// --- 按关键字搜索删除（增强） ---
function getAllMusicWithRefs(data) {
  const all = [];
  Object.keys(data).forEach(catKey => {
    const cat = data[catKey];
    const catTitle = cat.title || catKey;
    if (Array.isArray(cat.sites)) {
      cat.sites.forEach(site => all.push({ site, path: catTitle, parentArray: cat.sites }));
    }
    if (cat.subcategories && typeof cat.subcategories === 'object') {
      Object.keys(cat.subcategories).forEach(subKey => {
        const sub = cat.subcategories[subKey];
        const subTitle = sub.title || subKey;
        if (Array.isArray(sub.sites)) {
          sub.sites.forEach(site => all.push({ site, path: `${catTitle} -> ${subTitle}`, parentArray: sub.sites }));
        }
      });
    }
  });
  return all;
}

async function searchDeleteFlow(rl, data) {
  const keyword = await inputRequired(rl, '请输入搜索关键字:');
  const q = keyword.toLowerCase();
  const all = getAllMusicWithRefs(data);
  const results = all.filter(({ site }) => {
    return (
      (site.title && site.title.toLowerCase().includes(q)) ||
      (site.artist && site.artist.toLowerCase().includes(q)) ||
      (site.album && site.album.toLowerCase().includes(q)) ||
      (site.description && site.description.toLowerCase().includes(q)) ||
      (site.tags && site.tags.toLowerCase().includes(q)) ||
      (site.shareLink && site.shareLink.toLowerCase().includes(q)) ||
      (site.retrievalCode && String(site.retrievalCode).toLowerCase().includes(q))
    );
  });

  if (results.length === 0) {
    console.log('未找到匹配的音乐条目。');
    return;
  }

  console.log(`\n找到 ${results.length} 个匹配结果：`);
  results.forEach((r, i) => {
    console.log(`  [${i + 1}] ${r.site.title} - ${r.site.artist} - ${r.site.album}`);
    console.log(`      路径: ${r.path}`);
  });

  const ans = await ask(rl, "\n输入要删除的序号 (逗号分隔), 'a' 全删, 'q' 退出: ");
  if (ans.toLowerCase() === 'q') return;

  const idxs = ((input, max) => {
    if (!input) return null;
    if (input.toLowerCase() === 'a') return Array.from({ length: max }, (_, i) => i + 1);
    const parts = input.split(',').map(p => Number(p.trim())).filter(n => Number.isInteger(n));
    return Array.from(new Set(parts)).filter(n => n >= 1 && n <= max).sort((a,b)=>b-a);
  })(ans, results.length);

  if (!idxs) { console.log('输入无效。'); return; }

  console.log('\n即将删除:');
  idxs.slice().sort((a,b)=>a-b).forEach(i => console.log(`  [${i}] ${results[i - 1].site.title}`));

  if (await confirm(rl, '确认删除吗？')) {
    idxs.forEach(i => {
      const item = results[i - 1];
      const pos = item.parentArray.indexOf(item.site);
      if (pos > -1) item.parentArray.splice(pos, 1);
    });
    saveData(data);
    console.log(`✅ 已删除 ${idxs.length} 条。`);
  }
}


function isURL(s) {
  return /^https?:\/\//i.test(s);
}


// --- 编辑与移动辅助 ---
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

async function editOneMusic(rl, site) {
  site.title = await promptEditString(rl, '标题 (title)', site.title, { required: true });
  site.artist = await promptEditString(rl, '艺人 (artist)', site.artist, { required: true });
  site.album = await promptEditString(rl, '专辑 (album)', site.album, { required: true });
  site.retrievalCode = await promptEditString(rl, '取件码 (retrievalCode)', site.retrievalCode, { required: true });
  site.shareLink = await promptEditString(rl, '分享链接 (shareLink)', site.shareLink, { required: true, validator: isURL });
  site.tags = await promptEditString(rl, '标签 (tags 空格分隔)', site.tags, { required: true });
  site.cover = await promptEditString(rl, '封面 (cover)', site.cover || '', {});
  site.description = await promptEditString(rl, '描述 (description)', site.description || '', {});
  site.previewLink = await promptEditString(rl, '预览链接 (previewLink)', site.previewLink || '', { validator: (v)=> v === '' || isURL(v) });
}

async function browseEditFlow(rl, data) {
  const mainKeys = Object.keys(data);
  const mainPick = await pickFromList(rl, '请选择要从哪个主分类编辑：', mainKeys.map(k => data[k].title || k));
  const startKey = mainKeys[mainPick.index];
  const mainNode = data[startKey];

  let sites;
  let breadcrumb = mainNode.title || startKey;
  if (Array.isArray(mainNode.sites)) {
    sites = mainNode.sites;
  } else if (mainNode.subcategories && typeof mainNode.subcategories === 'object') {
    const subKeys = Object.keys(mainNode.subcategories);
    const subPick = await pickFromList(rl, `主分类 ${breadcrumb} -> 请选择子分类：`, subKeys.map(k => mainNode.subcategories[k].title || k));
    const subKey = subKeys[subPick.index];
    const sub = mainNode.subcategories[subKey];
    breadcrumb += ` -> ${sub.title || subKey}`;
    sites = sub.sites || (sub.sites = []);
  } else {
    console.log('该主分类下无可编辑条目。');
    return;
  }

  if (!sites || sites.length === 0) { console.log('该分类下暂无条目。'); return; }
  sites.forEach((s,i)=>console.log(`  [${i+1}] ${s.title} - ${s.artist} - ${s.album}`));
  const idxStr = await ask(rl, '请输入要编辑的序号：');
  const idx = Number(idxStr);
  if (!Number.isInteger(idx) || idx < 1 || idx > sites.length) { console.log('输入无效。'); return; }
  const site = sites[idx - 1];
  console.log('\n当前条目：');
  console.log(JSON.stringify(site, null, 2));
  await editOneMusic(rl, site);
  console.log('\n修改后：');
  console.log(JSON.stringify(site, null, 2));
}

async function searchEditFlow(rl, data) {
  const keyword = await inputRequired(rl, '请输入搜索关键字:');
  const q = keyword.toLowerCase();
  const all = getAllMusicWithRefs(data);
  const results = all.filter(({ site }) =>
    (site.title && site.title.toLowerCase().includes(q)) ||
    (site.artist && site.artist.toLowerCase().includes(q)) ||
    (site.album && site.album.toLowerCase().includes(q)) ||
    (site.tags && site.tags.toLowerCase().includes(q)));
  if (results.length === 0) { console.log('未找到匹配条目。'); return; }
  results.forEach((r,i)=>console.log(`  [${i+1}] ${r.site.title} - ${r.site.artist} - ${r.site.album} | ${r.path}`));
  const idxStr = await ask(rl, '请输入要编辑的序号：');
  const idx = Number(idxStr);
  if (!Number.isInteger(idx) || idx < 1 || idx > results.length) { console.log('输入无效。'); return; }
  const site = results[idx - 1].site;
  console.log('\n当前条目：');
  console.log(JSON.stringify(site, null, 2));
  await editOneMusic(rl, site);
  console.log('\n修改后：');
  console.log(JSON.stringify(site, null, 2));
}


// 编辑操作入口：分类或搜索
async function editFlow(rl, data) {
  const pick = await pickFromList(rl, '请选择编辑方式：', ['按分类浏览编辑', '按关键字搜索编辑', '返回主菜单']);
  if (pick.index === 0) await browseEditFlow(rl, data);
  else if (pick.index === 1) await searchEditFlow(rl, data);
}

async function moveFlow(rl, data) {
  const pick = await pickFromList(rl, '请选择选择来源方式：', ['按分类选择', '按关键字搜索', '取消']);
  let selected = [];
  if (pick.index === 0) {
    // 分类选择
    const mainKeys = Object.keys(data);
    const mainPick = await pickFromList(rl, '请选择来源主分类：', mainKeys.map(k => data[k].title || k));
    const startKey = mainKeys[mainPick.index];
    const mainNode = data[startKey];
    let sites;
    if (Array.isArray(mainNode.sites)) {
      sites = mainNode.sites;
    } else if (mainNode.subcategories && typeof mainNode.subcategories === 'object') {
      const subKeys = Object.keys(mainNode.subcategories);
      const subPick = await pickFromList(rl, `主分类 ${mainNode.title || startKey} -> 请选择子分类：`, subKeys.map(k => mainNode.subcategories[k].title || k));
      const subKey = subKeys[subPick.index];
      const sub = mainNode.subcategories[subKey];
      sites = sub.sites || (sub.sites = []);
    } else { console.log('该来源分类无条目。'); return; }
    if (!sites || sites.length === 0) { console.log('该来源分类无条目。'); return; }
    sites.forEach((s,i)=>console.log(`  [${i+1}] ${s.title} - ${s.artist} - ${s.album}`));
    const ans = await ask(rl, "输入要移动的序号（逗号分隔），或 'a' 全选： ");
    const idxs = parseIndexInput(ans, sites.length);
    if (!idxs) { console.log('输入无效。'); return; }
    selected = idxs.map(i => ({ site: sites[i-1], parentArray: sites }));
  } else if (pick.index === 1) {
    const keyword = await inputRequired(rl, '请输入搜索关键字:');
    const q = keyword.toLowerCase();
    const all = getAllMusicWithRefs(data);
    const results = all.filter(({ site }) =>
      (site.title && site.title.toLowerCase().includes(q)) ||
      (site.artist && site.artist.toLowerCase().includes(q)) ||
      (site.album && site.album.toLowerCase().includes(q)) ||
      (site.tags && site.tags.toLowerCase().includes(q)));
    if (results.length === 0) { console.log('未找到匹配条目。'); return; }
    results.forEach((r,i)=>console.log(`  [${i+1}] ${r.site.title} - ${r.site.artist} - ${r.site.album} | ${r.path}`));
    const ans = await ask(rl, "输入要移动的序号（逗号分隔），或 'a' 全选： ");
    const idxs = parseIndexInput(ans, results.length);
    if (!idxs) { console.log('输入无效。'); return; }
    selected = idxs.map(i => ({ site: results[i-1].site, parentArray: results[i-1].parentArray }));
  } else { return; }

  const { targetSites, breadcrumb } = await selectMusicTargetSites(rl, data);
  console.log(`\n将移动 ${selected.length} 条到：${breadcrumb}`);
  if (!await confirm(rl, '确认移动吗？')) return;
  selected.forEach(({ site, parentArray }) => {
    const pos = parentArray.indexOf(site);
    if (pos > -1) parentArray.splice(pos, 1);
    targetSites.push(site);
  });
  saveData(data);
  console.log('✅ 移动完成！');
}

async function cleanEmptyFlow(rl, data) {
  let removedSubs = 0;
  let removedMain = 0;
  // 清理空子分类
  Object.keys(data).forEach(catKey => {
    const cat = data[catKey];
    if (cat.subcategories && typeof cat.subcategories === 'object') {
      Object.keys(cat.subcategories).forEach(subKey => {
        const sub = cat.subcategories[subKey];
        const hasSites = Array.isArray(sub.sites) && sub.sites.length > 0;
        const hasSubs = sub.subcategories && Object.keys(sub.subcategories).length > 0;
        if (!hasSites && !hasSubs) { delete cat.subcategories[subKey]; removedSubs++; }
      });
      if (Object.keys(cat.subcategories).length === 0) delete cat.subcategories;
    }
    if (Array.isArray(cat.sites) && cat.sites.length === 0) delete cat.sites;
  });
  // 询问是否移除空主分类
  const removeMain = await confirm(rl, '是否删除“完全为空”的主分类？');
  if (removeMain) {
    Object.keys(data).forEach(catKey => {
      const cat = data[catKey];
      const noSites = !Array.isArray(cat.sites) || cat.sites.length === 0;
      const noSubs = !cat.subcategories || Object.keys(cat.subcategories).length === 0;
      if (noSites && noSubs) { delete data[catKey]; removedMain++; }
    });
  }
  saveData(data);
  console.log(`✅ 清理完成！删除空子分类 ${removedSubs} 个${removeMain ? `，删除空主分类 ${removedMain} 个` : ''}。`);
}

// --- 批量导入（CSV/JSON）（增强） ---
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
    title: idxOf('title'),
    artist: idxOf('artist'),
    album: idxOf('album'),
    retrievalCode: idxOf('retrievalCode'),
    shareLink: idxOf('shareLink'),
    tags: idxOf('tags'),
    cover: idxOf('cover'),
    description: idxOf('description'),
    previewLink: idxOf('previewLink')
  };
  const requiredMissing = ['title','artist','album','retrievalCode','shareLink','tags'].some(k => idx[k] === -1);
  if (requiredMissing) throw new Error('CSV 必须包含列：title,artist,album,retrievalCode,shareLink,tags（cover/description/previewLink 可选）');
  const items = [];
  rows.forEach(cols => {
    const obj = {
      title: cols[idx.title] || '',
      artist: cols[idx.artist] || '',
      album: cols[idx.album] || '',
      retrievalCode: cols[idx.retrievalCode] || '',
      shareLink: cols[idx.shareLink] || '',
      tags: cols[idx.tags] || ''
    };
    if (idx.cover !== -1 && cols[idx.cover]) obj.cover = cols[idx.cover];
    if (idx.description !== -1 && cols[idx.description]) obj.description = cols[idx.description];
    if (idx.previewLink !== -1 && cols[idx.previewLink]) obj.previewLink = cols[idx.previewLink];
    if (obj.title && obj.artist && obj.album && obj.retrievalCode && isURL(obj.shareLink) && obj.tags) items.push(obj);
  });
  return items;
}

async function selectMusicTargetSites(rl, data, allowCreateNew = false) {
  const mainKeys = Object.keys(data);
  const mainChoice = await pickFromList(rl, '请选择目标主分类：', mainKeys.map(k => data[k].title || k), allowCreateNew ? '新建主分类' : undefined);

  let chosenMainKey, mainNode;
  if (mainChoice.isNew) {
    while (true) {
      const key = await inputRequired(rl, '新主分类键（英文或不含空格）');
      if (!data[key]) { chosenMainKey = key; break; }
      console.log('该键已存在，请更换。');
    }
    const title = await inputRequired(rl, '主分类显示名称');
    const icon = await inputOptional(rl, '主分类图标（可选）');
    const color = await inputOptional(rl, '主分类颜色（可选）');
    data[chosenMainKey] = { title, icon: icon || undefined, color: color || undefined };
    Object.keys(data[chosenMainKey]).forEach(k => data[chosenMainKey][k] === undefined && delete data[chosenMainKey][k]);
    const hasSub = await confirm(rl, '该主分类是否包含子分类？');
    if (hasSub) data[chosenMainKey].subcategories = {}; else data[chosenMainKey].sites = [];
    mainNode = data[chosenMainKey];
  } else {
    chosenMainKey = mainKeys[mainChoice.index];
    mainNode = data[chosenMainKey];
  }

  let targetSites;
  let breadcrumb = mainNode.title || chosenMainKey;

  if (mainNode.subcategories && typeof mainNode.subcategories === 'object') {
    const subKeys = Object.keys(mainNode.subcategories);
    const subPick = await pickFromList(rl, `请选择 ${breadcrumb} 内的目标子分类：`, subKeys.map(k => mainNode.subcategories[k].title || k), allowCreateNew ? '新建子分类' : undefined);
    if (subPick.isNew) {
      let subKey;
      while (true) {
        const k = await inputRequired(rl, '新子分类键（英文或不含空格）');
        if (!mainNode.subcategories[k]) { subKey = k; break; }
        console.log('该键已存在，请更换。');
      }
      const subTitle = await inputRequired(rl, '子分类显示名称');
      const subIcon = await inputOptional(rl, '子分类图标（可选）');
      mainNode.subcategories[subKey] = { title: subTitle, icon: subIcon || undefined, sites: [] };
      Object.keys(mainNode.subcategories[subKey]).forEach(k => mainNode.subcategories[subKey][k] === undefined && delete mainNode.subcategories[subKey][k]);
      targetSites = mainNode.subcategories[subKey].sites;
      breadcrumb += ` -> ${subTitle}`;
    } else {
      const subKey = subKeys[subPick.index];
      const sub = mainNode.subcategories[subKey];
      if (!Array.isArray(sub.sites)) sub.sites = [];
      targetSites = sub.sites;
      breadcrumb += ` -> ${sub.title || subKey}`;
    }
  } else {
    if (!Array.isArray(mainNode.sites)) mainNode.sites = [];
    targetSites = mainNode.sites;
  }

  return { targetSites, breadcrumb };
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
        title: x.title || '',
        artist: x.artist || '',
        album: x.album || '',
        retrievalCode: x.retrievalCode || '',
        shareLink: x.shareLink || '',
        tags: x.tags || '',
        cover: x.cover,
        description: x.description,
        previewLink: x.previewLink
      })).filter(o => o.title && o.artist && o.album && o.retrievalCode && isURL(o.shareLink) && o.tags);
    } else if (ext === '.csv') {
      items = parseCSV(raw);
    } else {
      console.log('仅支持 .csv 或 .json 文件。');
      return;
    }
  } catch (e) {
    console.log('解析失败：' + e.message);
    return;
  }

  if (items.length === 0) { console.log('未解析到有效条目。'); return; }
  console.log(`\n解析到 ${items.length} 条有效条目，预览前 5 条：`);
  items.slice(0,5).forEach((it,i)=>console.log(`  [${i+1}] ${it.title} - ${it.artist} - ${it.album}`));

  const { targetSites, breadcrumb } = await selectMusicTargetSites(rl, data);

  // 去重策略
  const dedupPick = await pickFromList(rl, '请选择导入去重策略：', ['按 title+artist+album', '按 retrievalCode', '按 shareLink', '不去重']);
  function keyOf(item) {
    if (dedupPick.index === 0) return `${item.title}||${item.artist}||${item.album}`.toLowerCase();
    if (dedupPick.index === 1) return `rc:${String(item.retrievalCode).toLowerCase()}`;
    if (dedupPick.index === 2) return `sl:${String(item.shareLink).toLowerCase()}`;
    return `idx:${Math.random()}`; // no dedup
  }
  const existingKeys = new Set((targetSites || []).map(keyOf));
  const uniqueItems = [];
  const seen = new Set();
  items.forEach(it => {
    const k = keyOf(it);
    if (dedupPick.index !== 3 && (existingKeys.has(k) || seen.has(k))) return;
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


// 删除操作的入口：分类浏览 或 搜索删除
async function deleteFlow(rl, data) {
  const choice = await pickFromList(rl, '请选择删除方式：', ['按分类浏览删除', '按关键字搜索删除', '返回主菜单']);
  if (choice.index === 0) await browseDeleteFlow(rl, data);
  else if (choice.index === 1) await searchDeleteFlow(rl, data);
}


async function addFlow(rl, data) {
  const { targetSites, breadcrumb } = await selectMusicTargetSites(rl, data, true);
  while (true) {
    console.log(`\n将在 ${breadcrumb} 中添加新的音乐条目：`);
    const title = await inputRequired(rl, '歌曲标题 (title)');
    const artist = await inputRequired(rl, '艺人 (artist)');
    const album = await inputRequired(rl, '专辑 (album)');
    const retrievalCode = await inputRequired(rl, '取件码 (retrievalCode)');
    const shareLink = await inputRequired(rl, '分享链接 (shareLink)', isURL);
    const tags = await inputRequired(rl, '标签 (tags, 空格分隔)');
    const cover = await inputOptional(rl, '封面链接 (cover)');
    const description = await inputOptional(rl, '描述 (description)');
    const previewLink = await inputOptional(rl, '预览链接 (previewLink)', isURL);

    const newItem = { title, artist, album, retrievalCode, shareLink, tags };
    if (!isEmpty(cover)) newItem.cover = cover;
    if (!isEmpty(description)) newItem.description = description;
    if (!isEmpty(previewLink)) newItem.previewLink = previewLink;

    console.log('\n即将添加:');
    console.log(JSON.stringify(newItem, null, 2));
    if (!await confirm(rl, '确认添加吗？')) {
      if (!await confirm(rl, '已取消，是否继续添加其他条目？')) break;
      continue;
    }

    if (!Array.isArray(targetSites)) targetSites = [];
    targetSites.push(newItem);
    saveData(data);
    console.log('✅ 添加成功！');

    if (!await confirm(rl, '是否继续在当前分类下添加？')) break;
  }
}

(async function main() {
  const rl = createRL();
  try {
    const { data } = loadData();
    const action = await pickFromList(rl, '请选择操作：', [
      '添加音乐',
      '删除音乐',
      '编辑音乐',
      '移动音乐',
      '清理空分类/子分类',
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


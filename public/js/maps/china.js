import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/china-provinces.json');
  cachedData = await resp.json();
  return cachedData;
}

const chineseToSlug = {
  '新疆维吾尔自治区': 'xinjiang',
  '西藏自治区': 'tibet',
  '内蒙古自治区': 'inner-mongolia',
  '青海省': 'qinghai',
  '四川省': 'sichuan',
  '黑龙江省': 'heilongjiang',
  '甘肃省': 'gansu',
  '云南省': 'yunnan',
  '广西壮族自治区': 'guangxi',
  '湖南省': 'hunan',
  '陕西省': 'shaanxi',
  '广东省': 'guangdong',
  '吉林省': 'jilin',
  '河北省': 'hebei',
  '湖北省': 'hubei',
  '贵州省': 'guizhou',
  '山东省': 'shandong',
  '江西省': 'jiangxi',
  '河南省': 'henan',
  '辽宁省': 'liaoning',
  '山西省': 'shanxi',
  '安徽省': 'anhui',
  '福建省': 'fujian',
  '浙江省': 'zhejiang',
  '江苏省': 'jiangsu',
  '重庆市': 'chongqing',
  '宁夏回族自治区': 'ningxia',
  '海南省': 'hainan',
  '台湾省': 'taiwan',
  '北京市': 'beijing',
  '天津市': 'tianjin',
  '上海市': 'shanghai',
  '香港特别行政区': 'hong-kong',
  '澳门特别行政区': 'macau',
};

export async function renderMap(container) {
  const china = await loadData();

  container.innerHTML = '';

  const padTop = 60, padBottom = 40;
  const width = 800, height = 600;
  const projection = d3.geoMercator().fitExtent(
    [[0, padTop], [width, height - padBottom]], china
  );
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.province")
    .data(china.features)
    .join("path")
    .attr("class", "province")
    .attr("d", path)
    .attr("id", d => chineseToSlug[d.properties.name] || d.properties.name);
}

export const names = {
  'beijing': 'Beijing',
  'tianjin': 'Tianjin',
  'hebei': 'Hebei',
  'shanxi': 'Shanxi',
  'inner-mongolia': 'Inner Mongolia',
  'liaoning': 'Liaoning',
  'jilin': 'Jilin',
  'heilongjiang': 'Heilongjiang',
  'shanghai': 'Shanghai',
  'jiangsu': 'Jiangsu',
  'zhejiang': 'Zhejiang',
  'anhui': 'Anhui',
  'fujian': 'Fujian',
  'jiangxi': 'Jiangxi',
  'shandong': 'Shandong',
  'henan': 'Henan',
  'hubei': 'Hubei',
  'hunan': 'Hunan',
  'guangdong': 'Guangdong',
  'guangxi': 'Guangxi',
  'hainan': 'Hainan',
  'chongqing': 'Chongqing',
  'sichuan': 'Sichuan',
  'guizhou': 'Guizhou',
  'yunnan': 'Yunnan',
  'tibet': 'Tibet',
  'shaanxi': 'Shaanxi',
  'gansu': 'Gansu',
  'qinghai': 'Qinghai',
  'ningxia': 'Ningxia',
  'xinjiang': 'Xinjiang',
  'hong-kong': 'Hong Kong',
  'macau': 'Macau',
  'taiwan': 'Taiwan',
};

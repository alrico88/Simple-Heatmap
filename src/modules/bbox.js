import {calcDomain} from 'math-helper-functions';

export function getBBox(points, latAccessor, lonAccessor) {
  const [minLat, maxLat] = calcDomain(points.map(latAccessor));
  const [minLon, maxLon] = calcDomain(points.map(lonAccessor));
  return [minLon, minLat, maxLon, maxLat];
}

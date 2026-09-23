export type LatLng = [number, number];

export const POI: Record<string, LatLng> = {
  tpe: [25.0797, 121.2342],
  tsa: [25.0697, 121.5519],
  taipei101: [25.0338, 121.5645],
  main: [25.0478, 121.517],
  xinyi: [25.033, 121.5654],
  beitou: [25.1325, 121.498],
  jiufen: [25.1096, 121.8446],
  banqiao: [25.0143, 121.4639],
  daan: [25.026, 121.5434],
  neihu: [25.0796, 121.575],
  tamsui: [25.1677, 121.4406],
  khh: [22.5771, 120.35],
  kenting: [21.9483, 120.7798],
};

export const FLEET_ROUTES: LatLng[][] = [
  [POI.tpe, [25.06, 121.32], [25.05, 121.42], [25.04, 121.5], POI.taipei101],
  [POI.taipei101, POI.xinyi, POI.main, POI.tsa],
  [POI.daan, POI.xinyi, POI.neihu],
  [POI.tamsui, [25.1, 121.48], POI.main],
  [POI.banqiao, POI.main, POI.taipei101],
  [POI.beitou, [25.08, 121.51], POI.main],
];

export function along(path: LatLng[], t: number): LatLng {
  const u = ((t % 1) + 1) % 1;
  const segs = path.length - 1;
  const x = u * segs;
  const i = Math.min(segs - 1, Math.floor(x));
  const f = x - i;
  const a = path[i];
  const b = path[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

export function heading(a: LatLng, b: LatLng) {
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

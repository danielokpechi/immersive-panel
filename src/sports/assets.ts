// ═══════════════════════════════════════════════════════════
// Image asset packs — themed photo pools per team, served from
// public/assets/<team>/. Generated from the dropped image sets.
// Used for hero backgrounds, highlights thumbnails and store imagery.
// ═══════════════════════════════════════════════════════════

import { BASE_URL } from '../config';

const pack = (team: string, files: string[]): string[] =>
  files.map((f) => `${BASE_URL}assets/${team}/${f}`);

export const ASSET_PACKS: Record<string, string[]> = {
  f1_ferrari: pack('f1_ferrari', ['ferrari_01.jpg','ferrari_02.jpg','ferrari_03.jpg','ferrari_04.jpg','ferrari_05.jpg','ferrari_07.jpg','ferrari_08.jpg','ferrari_09.jpg']),
  f1_haas: pack('f1_haas', ['haas_01.jpg','haas_03.jpg','haas_04.jpg','haas_06.jpg','haas_07.jpg','haas_08.jpg','haas_09.jpg','haas_10.jpg']),
  f1_mclaren: pack('f1_mclaren', ['mclaren_01.jpg','mclaren_02.jpg','mclaren_04.jpg','mclaren_06.jpg','mclaren_08.jpg','mclaren_10.jpg']),
  f1_mercedes: pack('f1_mercedes', ['mercedes_01.jpg','mercedes_02.jpg','mercedes_03.jpg','mercedes_06.jpg','mercedes_08.jpg','mercedes_09.jpg']),
  manchester_united: pack('manchester_united', ['manutd_01.jpg','manutd_02.jpg','manutd_03.jpg','manutd_04.jpg','manutd_06.jpg','manutd_07.jpg','manutd_08.jpg','manutd_09.jpg','manutd_10.jpg']),
  mayweather: pack('mayweather', ['mayweather_01.jpg','mayweather_02.jpg','mayweather_03.jpg','mayweather_04.jpg','mayweather_05.jpg','mayweather_06.jpg','mayweather_07.jpg','mayweather_08.jpg','mayweather_09.jpg','mayweather_10.jpg']),
  mcgregor: pack('mcgregor', ['mcgregor_01.jpg','mcgregor_02.jpg','mcgregor_03.jpg','mcgregor_04.jpg','mcgregor_05.jpg','mcgregor_06.jpg','mcgregor_07.jpg','mcgregor_08.jpg','mcgregor_10.jpg']),
  rugby: pack('rugby', ['rugby_01.jpg','rugby_02.jpg','rugby_03.jpg','rugby_04.jpg','rugby_05.jpg','rugby_06.jpg','rugby_07.jpg','rugby_08.jpg','rugby_09.jpg','rugby_10.jpg']),
  ufc: pack('ufc', ['ufc_01.jpg','ufc_02.jpg','ufc_03.jpg','ufc_04.jpg','ufc_05.jpg','ufc_06.jpg','ufc_07.jpg','ufc_08.jpg','ufc_09.jpg','ufc_10.jpg']),
};

/** Photo pool for a panel's asset key (empty when none configured). */
export function assetsFor(key?: string): string[] {
  return (key && ASSET_PACKS[key]) || [];
}

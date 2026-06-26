// ═══════════════════════════════════════════════════════════
// Per-club name maps for the legacy MCFC prototype. The prototype bakes in
// Man City players/manager/venue/abbreviation; these remap them to each
// club's real 2025/26 people so a reskinned panel reads fully custom.
// Keyed by branding.name. Sources: club/season squad pages (2025/26).
// ═══════════════════════════════════════════════════════════

export const CLUB_RESKIN: Record<string, Record<string, string>> = {
  'Man Utd': {
    Haaland: 'Šeško',
    Foden: 'Mbeumo',
    'De Bruyne': 'Bruno Fernandes',
    'Bernardo Silva': 'Cunha',
    'B. Silva': 'Cunha',
    Ederson: 'Lammens',
    Doku: 'Amad',
    Rodri: 'Casemiro',
    Kovačić: 'Mainoo',
    Cherki: 'Yoro',
    'Rúben Dias': 'De Ligt',
    Gvardiol: 'Martínez',
    Guardiola: 'Amorim',
    Pep: 'Amorim',
    Etihad: 'Old Trafford',
    MCFC: 'MUFC',
    MCI: 'MUN',
  },
  QPR: {
    Haaland: 'Koné',
    Foden: 'Burrell',
    'De Bruyne': 'Edwards',
    'Bernardo Silva': 'Burrell',
    'B. Silva': 'Burrell',
    Ederson: 'Nardi',
    Doku: 'Koné',
    Rodri: 'Edwards',
    Kovačić: 'Burrell',
    Cherki: 'Koné',
    'Rúben Dias': 'Edwards',
    Gvardiol: 'Edwards',
    Guardiola: 'Stéphan',
    Pep: 'Stéphan',
    Etihad: 'Loftus Road',
    MCFC: 'QPR',
    MCI: 'QPR',
  },
  Austria: {
    Haaland: 'Arnautović',
    Foden: 'Baumgartner',
    'De Bruyne': 'Sabitzer',
    'Bernardo Silva': 'Schmid',
    'B. Silva': 'Schmid',
    Ederson: 'Schlager',
    Doku: 'Wimmer',
    Rodri: 'Seiwald',
    Kovačić: 'Laimer',
    Cherki: 'Wimmer',
    'Rúben Dias': 'Lienhart',
    Gvardiol: 'Alaba',
    Guardiola: 'Rangnick',
    Pep: 'Rangnick',
    Etihad: 'Ernst-Happel-Stadion',
    MCFC: 'AUT',
    MCI: 'AUT',
  },
};

export function reskinNamesFor(teamName?: string): Record<string, string> | undefined {
  return teamName ? CLUB_RESKIN[teamName] : undefined;
}

import { TarotCard } from '../types';

export const TAROT_DECK: TarotCard[] = [
  // Major Arcana
  { id: 'm00', name: 'The Fool', arcana: 'Major', rank: 0 },
  { id: 'm01', name: 'The Magician', arcana: 'Major', rank: 1 },
  { id: 'm02', name: 'The High Priestess', arcana: 'Major', rank: 2 },
  { id: 'm03', name: 'The Empress', arcana: 'Major', rank: 3 },
  { id: 'm04', name: 'The Emperor', arcana: 'Major', rank: 4 },
  { id: 'm05', name: 'The Hierophant', arcana: 'Major', rank: 5 },
  { id: 'm06', name: 'The Lovers', arcana: 'Major', rank: 6 },
  { id: 'm07', name: 'The Chariot', arcana: 'Major', rank: 7 },
  { id: 'm08', name: 'Strength', arcana: 'Major', rank: 8 },
  { id: 'm09', name: 'The Hermit', arcana: 'Major', rank: 9 },
  { id: 'm10', name: 'Wheel of Fortune', arcana: 'Major', rank: 10 },
  { id: 'm11', name: 'Justice', arcana: 'Major', rank: 11 },
  { id: 'm12', name: 'The Hanged Man', arcana: 'Major', rank: 12 },
  { id: 'm13', name: 'Death', arcana: 'Major', rank: 13 },
  { id: 'm14', name: 'Temperance', arcana: 'Major', rank: 14 },
  { id: 'm15', name: 'The Devil', arcana: 'Major', rank: 15 },
  { id: 'm16', name: 'The Tower', arcana: 'Major', rank: 16 },
  { id: 'm17', name: 'The Star', arcana: 'Major', rank: 17 },
  { id: 'm18', name: 'The Moon', arcana: 'Major', rank: 18 },
  { id: 'm19', name: 'The Sun', arcana: 'Major', rank: 19 },
  { id: 'm20', name: 'Judgement', arcana: 'Major', rank: 20 },
  { id: 'm21', name: 'The World', arcana: 'Major', rank: 21 },
  // Minor Arcana - Wands
  ...['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'].map((rank, i) => ({
    id: `w${i + 1}`, name: `${rank} of Wands`, arcana: 'Minor' as const, suit: 'Wands' as const, rank
  })),
  // Minor Arcana - Cups
  ...['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'].map((rank, i) => ({
    id: `c${i + 1}`, name: `${rank} of Cups`, arcana: 'Minor' as const, suit: 'Cups' as const, rank
  })),
  // Minor Arcana - Swords
  ...['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'].map((rank, i) => ({
    id: `s${i + 1}`, name: `${rank} of Swords`, arcana: 'Minor' as const, suit: 'Swords' as const, rank
  })),
  // Minor Arcana - Pentacles
  ...['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Page', 'Knight', 'Queen', 'King'].map((rank, i) => ({
    id: `p${i + 1}`, name: `${rank} of Pentacles`, arcana: 'Minor' as const, suit: 'Pentacles' as const, rank
  }))
];

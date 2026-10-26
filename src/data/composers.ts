import defaultVideo from '../../default_video.mp4'

export interface Composer {
  id: number
  name: string
  description: string
  freq1: number
  freq2: number
  likesCount: number
  imageUrl: string
  videoUrl: string
}

export const COMPOSERS_MOCK: Composer[] = [
  {
    id: 1,
    name: 'Иоганн Себастьян Бах',
    description:
      'Немецкий композитор и органист эпохи барокко. Его музыка известна строгой полифонией и гармонической выразительностью.',
    freq1: 38.5,
    freq2: 12.4,
    likesCount: 128,
    imageUrl: '',
    videoUrl: '',
  },
  {
    id: 2,
    name: 'Вольфганг Амадей Моцарт',
    description:
      'Австрийский композитор, один из самых ярких представителей венской классической школы.',
    freq1: 44.2,
    freq2: 18.7,
    likesCount: 96,
    imageUrl: '',
    videoUrl: defaultVideo,
  },
  {
    id: 3,
    name: 'Людвиг ван Бетховен',
    description:
      'Немецкий композитор и пианист, чьи произведения стали связующим звеном между классицизмом и романтизмом.',
    freq1: 52.8,
    freq2: 21.3,
    likesCount: 214,
    imageUrl: '',
    videoUrl: '',
  },
  {
    id: 4,
    name: 'Фридерик Шопен',
    description:
      'Польский композитор и пианист. Большая часть его наследия посвящена фортепиано.',
    freq1: 27.4,
    freq2: 16.9,
    likesCount: 82,
    imageUrl: '',
    videoUrl: '',
  },
  {
    id: 5,
    name: 'Пётр Ильич Чайковский',
    description:
      'Русский композитор, автор симфоний, балетов и опер, получивших мировое признание.',
    freq1: 63.1,
    freq2: 24.5,
    likesCount: 173,
    imageUrl: '',
    videoUrl: '',
  },
  {
    id: 6,
    name: 'Клод Дебюсси',
    description:
      'Французский композитор, чья музыка открыла новые возможности тембра и гармонии.',
    freq1: 71.6,
    freq2: 31.2,
    likesCount: 61,
    imageUrl: '',
    videoUrl: '',
  },
]

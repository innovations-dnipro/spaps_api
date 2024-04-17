import * as dotenv from 'dotenv'

dotenv.config()

export const LATIN_CYRILLIC_LETTER_NAME_REGEX =
  /^[A-Za-zАаБбВвГгҐґДдЕеЁёЄєЭэЖжЗзІіЇїИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЮюЯя'-]+$/g
export const LATIN_CYRILLIC_LETTER_TITLE_REGEX =
  /^[0-9A-Za-zАаБбВвГгҐґДдЕеЁёЄєЭэЖжЗзІіЇїИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЮюЯя'-\s]+$/g
export const PHONE_REGEX = new RegExp(
  `^[0-9]{1,${process.env.MAX_PHONE_LENGTH}}$`,
)
export const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

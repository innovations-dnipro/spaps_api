import { EError } from '../enums'

export const CError = {
  //NOTE: Already exists
  NAME_ALREADY_EXISTS: `${EError.NAME_ALREADY_EXISTS}: An item with this name already exists.`,
  PHONE_ALREADY_EXISTS: `${EError.PHONE_ALREADY_EXISTS}: An item with this phone already exists.`,
  EMAIL_ALREADY_EXISTS: `${EError.EMAIL_ALREADY_EXISTS}: An item with this email already exists.`,
  CLIENT_ALREADY_EXITS: `${EError.CLIENT_ALREADY_EXITS}: This user account already has a client profile.`,
  //NOTE: Wrong enum
  WRONG_ENUM: `${EError.WRONG_ENUM}: Wrong enum value.`,
  WRONG_CONFIRMATION_CODE: `${EError.WRONG_CONFIRMATION_CODE}: The cofirmation code is either wrong or expired.`,
  WRONG_PASSWORD: `${EError.WRONG_PASSWORD}: Wrong password.`,
  WRONG_USER_ID_OR_CLIENT_ID: `${EError.WRONG_USER_ID_OR_CLIENT_ID}: Token user id and client id are not related.`,
  //NOTE: too early request
  IS_CONFIRMATION_CODE_TOO_SOON: `${EError.IS_CONFIRMATION_CODE_TOO_SOON}: Request to create new confirmation code is too soon. Wait one minute since last code creation.`,
  //NOTE: no token
  NO_REGISTER_TOKEN: `${EError.NO_REGISTER_TOKEN}: No registration token.`,
  NO_PASSWORD_RESTORATION_TOKEN: `${EError.NO_PASSWORD_RESTORATION_TOKEN}: No password restoration token.`,
  NO_TOKEN: `${EError.NO_TOKEN}: There is no token in cookies. Nobody is logged in.`,
  //NOTE: not found
  USER_NOT_FOUND: `${EError.USER_NOT_FOUND}: User was not found.`,
  EMAIL_NOT_FOUND: `${EError.EMAIL_NOT_FOUND}: Email was not found`,
  CLIENT_NOT_FOUND: `${EError.CLIENT_NOT_FOUND}: Client was not found`,
  FILE_NOT_FOUND: `${EError.FILE_NOT_FOUND}: A file was not found.`,
  //NOTE: File error
  NO_FILE_PROVIDED: `${EError.NO_FILE_PROVIDED}: No file was provided.`,
  FILE_ID_NOT_RELATED: `${EError.FILE_ID_NOT_RELATED}: The item has no related file with this id.`,
  FILE_ID_NOT_RELATED_TO_SECTION: `${EError.FILE_ID_NOT_RELATED_TO_SECTION}: A file with this id is not related to this file section.`,
  FILE_SIZE_TOO_BIG: `${EError.FILE_SIZE_TOO_BIG}: File size exceeds the maximum limit.`,
}

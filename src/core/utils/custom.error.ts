import { EError } from '../enums'

export const CError = {
  //NOTE: Already exists
  NAME_ALREADY_EXISTS: `${EError.NAME_ALREADY_EXISTS}: An item with this name already exists.`,
  PHONE_ALREADY_EXISTS: `${EError.PHONE_ALREADY_EXISTS}: An item with this phone already exists.`,
  EMAIL_ALREADY_EXISTS: `${EError.EMAIL_ALREADY_EXISTS}: An item with this email already exists.`,
  //NOTE: Wrong enum
  WRONG_ENUM: `${EError.WRONG_ENUM}: Wrong enum value.`,
  WRONG_CONFIRMATION_CODE: `${EError.WRONG_CONFIRMATION_CODE}: The cofirmation code is either wrong or expired.`,
  WRONG_PASSWORD: `${EError.WRONG_PASSWORD}: Wrong password.`,
  //NOTE: too early request
  IS_CONFIRMATION_CODE_TOO_SOON: `${EError.IS_CONFIRMATION_CODE_TOO_SOON}: Request to create new confirmation code is too soon. Wait one minute since last code creation.`,
  //NOTE: no token
  NO_REGISTER_TOKEN: `${EError.NO_REGISTER_TOKEN}: No registration token.`,
  NO_PASSWORD_RESTORATION_TOKEN: `${EError.NO_PASSWORD_RESTORATION_TOKEN}: No password restoration token.`,
  NO_TOKEN: `${EError.NO_TOKEN}: There is no token in cookies. Nobody is logged in.`,
  //NOTE: not found
  USER_NOT_FOUND: `${EError.USER_NOT_FOUND}: User was not found.`,
  EMAIL_NOT_FOUND: `${EError.EMAIL_NOT_FOUND}: Email was not found`,
}

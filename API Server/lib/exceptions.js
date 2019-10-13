/**
 * Custom Exception
 */

exports.CustomException = class CustomException {
    constructor(code, msg) {
        this.code = code
        this.msg = msg
    }
}

exports.CustomExceptionCodes = {
    UnknownError: "UnknownError",
    AlreadyExists: "AlreadyExists",
    InvalidRequest: "InvalidRequest",
    NotFound: "NotFound",
    ValidationFailed: "ValidationFailed",
    AccessDenied: "AccessDenied",
    //InvalidAuthHeader: "InvalidAuthHeader",
    //CreateUserFailed: "CreateUserFailed",
    //UserNotFound: "UserNotFound",
    //ProcessingError: "ProcessingError",
    //Expired: "Expired"
}
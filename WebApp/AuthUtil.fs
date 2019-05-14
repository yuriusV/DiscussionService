module AuthUtil
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Authentication
open Microsoft.AspNetCore.Authentication.Cookies
open DataAccess
open System.Linq
open System.Security.Claims
open System.Security.Cryptography
//https://github.com/giraffe-fsharp/Giraffe/blob/master/samples/SampleApp/SampleApp/Program.fs

// Prepare
let authScheme = CookieAuthenticationDefaults.AuthenticationScheme
let issuer = "localhost"
let getPasswordHash = id

// Go
let generateSessionToken() = System.Convert.ToBase64String(System.Guid.NewGuid().ToByteArray())

let getCurrentUserId (context: HttpContext) = 
    let userId = context.User.FindFirst(fun x -> x.Subject.Name = "id")
    let userToken = context.User.FindFirst(fun x -> x.Subject.Name = "token")
    if not (isNull userId || isNull userToken) then
        let userIdParsed = System.Int64.Parse(userId.Value)
        let dbRes = AuthQueries.getLoginData userToken
        if ((getSingleRowValue<int64> dbRes "Exists") = int64(1) 
            && (getSingleRowValue<int64> dbRes "Id") = userIdParsed ) then int32(userIdParsed)
        else 0
    else 0


let register (context: HttpContext) fullName login password =
    let time = System.DateTime.Now
    let token = generateSessionToken()
    let isExists = AuthQueries.getAlreadyExistsLogin login
    if (getSingleRowValue<int64> isExists "Count") <> int64(0) then false
    else
        let loginData = AuthQueries.register fullName login (getPasswordHash password) token time
        let userId = (Map.find "id" (Array.head loginData)) :?> int64
        let claims = [
            Claim("id", (userId.ToString()),  ClaimValueTypes.String, issuer)
            Claim("token", token, ClaimValueTypes.String, issuer)
        ]
        let identity = ClaimsIdentity(claims, authScheme)
        let user = ClaimsPrincipal(identity)

        context.SignInAsync(authScheme, user).GetAwaiter().GetResult()
        true


let loginWithCredentials (context: HttpContext) login password =
    let passHash = getPasswordHash password
    let data = AuthQueries.checkCredentials login passHash
    if (getSingleRowValue<int64> data "Exists") = int64(1) then
        let userId = getSingleRowValue<int64> data "Id"
        let token = generateSessionToken()
        AuthQueries.setTokenToUser userId token |> ignore
        let claims = [
            Claim("id", (userId.ToString()),  ClaimValueTypes.String, issuer)
            Claim("token", token, ClaimValueTypes.String, issuer)
        ]
        let identity = ClaimsIdentity(claims, authScheme)
        let user = ClaimsPrincipal(identity)

        context.SignInAsync(authScheme, user).GetAwaiter().GetResult()
        true
    else false


let logout (context: HttpContext) =
    let userId = getCurrentUserId context
    if userId <> 0 then
        AuthQueries.logout (context.User.FindFirst(fun x -> x.Subject.Name = "token").Value) |> ignore
        context.SignOutAsync().GetAwaiter().GetResult()
        true
    else false